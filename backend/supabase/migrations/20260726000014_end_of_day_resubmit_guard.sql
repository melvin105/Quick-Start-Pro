-- ============================================================
-- DrivePro / Quick Start Pro — 14_end_of_day_resubmit_guard.sql  (run FOURTEENTH)
-- Follow-up fix for #56.
--
-- submit_end_of_day() (migration 05, re-defined in migration 13) upserts
-- unconditionally on (closure_date): its ON CONFLICT DO UPDATE has no guard
-- against the row already being 'closed'. Verified live: submit -> approve
-- (status becomes 'closed') -> submit again on the same date silently flips
-- status back to 'pending_approval', with approved_by/approved_at left
-- stale from the earlier approval. No error is raised. Any secretary can
-- reopen an already-approved day at any time, defeating the point of the
-- manager approval step (payments/expenses are locked via
-- trg_lock_payments/trg_lock_expenses once closed, but the closure record
-- itself was not).
--
-- Fix: raise the same style of exception approve_end_of_day() already uses
-- for its "nothing pending" case, so the app layer can translate it into a
-- clean 409 rather than silently succeeding.
-- ============================================================

create or replace function public.submit_end_of_day(p_date date)
returns public.daily_closures
language plpgsql
security definer
as $$
declare
  v_open   numeric(12,2);
  v_income numeric(12,2);
  v_exp    numeric(12,2);
  v_row    public.daily_closures;
  v_uid    uuid := nullif(current_setting('app.current_user_id', true), '')::uuid;
begin
  if exists (
    select 1 from public.daily_closures
    where closure_date = p_date and status = 'closed'
  ) then
    raise exception 'Day % has already been approved and closed', p_date;
  end if;

  select coalesce(
    (select closing_balance from public.daily_closures
      where closure_date < p_date and status = 'closed'
      order by closure_date desc limit 1), 0)
  into v_open;

  select coalesce(sum(amount), 0) into v_income
  from public.payments where payment_date = p_date;

  select coalesce(sum(amount), 0) into v_exp
  from public.expenses where expense_date = p_date;

  insert into public.daily_closures
    (closure_date, opening_balance, total_income, total_expenses,
     closing_balance, status, submitted_by, submitted_at)
  values
    (p_date, v_open, v_income, v_exp,
     v_open + v_income - v_exp, 'pending_approval', v_uid, now())
  on conflict (closure_date) do update
    set opening_balance = excluded.opening_balance,
        total_income    = excluded.total_income,
        total_expenses  = excluded.total_expenses,
        closing_balance = excluded.closing_balance,
        status          = 'pending_approval',
        submitted_by    = v_uid,
        submitted_at    = now()
  returning * into v_row;

  -- Notify the manager
  insert into public.notifications (recipient_role, type, title, body, link_url)
  values ('manager', 'end_of_day',
          'End of day submitted — review needed',
          to_char(p_date, 'FMDay DD Mon') || ' submitted for approval',
          '/finances');
  return v_row;
end;
$$;
