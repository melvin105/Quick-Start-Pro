-- ============================================================
-- DrivePro / Quick Start Pro — 13_end_of_day_attribution.sql  (run THIRTEENTH)
-- Resolves issue #56 (End-of-day submission exposed over the API).
--
-- submit_end_of_day() and approve_end_of_day() (migration 05) were
-- written assuming Supabase Auth: they use auth.uid() for
-- submitted_by/approved_by, and approve_end_of_day() gates itself
-- with get_my_role() (which also reads auth.uid() under the hood).
-- Per ADR-003/ADR-004 (see 09_audit_attribution.sql), this backend
-- connects via a plain pg pool with its own JWT auth, so auth.uid()
-- always resolves NULL here — both columns would silently stay NULL
-- on every call, and the in-function role check would never fire
-- (NULL <> 'manager' is NULL, which plpgsql's `if` treats as false).
--
-- Fix: attribute via the same app.current_user_id GUC the audit
-- trigger uses, set transaction-locally by Express's withUserContext.
-- Drop the dead role check entirely rather than leave it as
-- non-functional — the real gate is requireRole('manager') on
-- POST /api/v1/end-of-day/approve (role_permissions already reflects
-- this: records.approve_close_day is manager-only, records.submit_end_of_day
-- is secretary-only).
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

create or replace function public.approve_end_of_day(p_date date)
returns public.daily_closures
language plpgsql
security definer
as $$
declare
  v_row public.daily_closures;
  v_uid uuid := nullif(current_setting('app.current_user_id', true), '')::uuid;
begin
  update public.daily_closures
     set status = 'closed', approved_by = v_uid, approved_at = now()
   where closure_date = p_date and status = 'pending_approval'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'No pending submission found for %', p_date;
  end if;
  return v_row;
end;
$$;
