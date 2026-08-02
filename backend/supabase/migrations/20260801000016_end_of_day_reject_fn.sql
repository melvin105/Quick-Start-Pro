-- ============================================================
-- DrivePro / Quick Start Pro — 16_end_of_day_reject_fn.sql  (run SIXTEENTH)
-- Backend gap #101 — End-of-day reject/flag (continues migration 15).
--
-- 1. reject_end_of_day(date, note): the manager flags a pending_approval day
--    back to the secretary. Mirrors approve_end_of_day()'s shape — attributes
--    the reviewer via app.current_user_id (approved_by/approved_at double as
--    the "reviewed by/at" stamp, as they already do on approval), raises the
--    same "No pending submission found" exception when nothing is pending
--    (the app layer maps that to 404), and notifies the secretary.
--
-- 2. submit_end_of_day(): resubmitting now clears any prior flag — the remarks
--    note and the stale reviewer stamp — so a corrected, resubmitted day
--    reaches the manager clean (matching the records store's submitDay, which
--    clears flagNote). Otherwise identical to migration 14 (still blocks
--    resubmitting an already-'closed' day).
-- ============================================================

create or replace function public.reject_end_of_day(p_date date, p_note text)
returns public.daily_closures
language plpgsql
security definer
as $$
declare
  v_row public.daily_closures;
  v_uid uuid := nullif(current_setting('app.current_user_id', true), '')::uuid;
begin
  if p_note is null or btrim(p_note) = '' then
    raise exception 'A reason is required to flag a day';
  end if;

  update public.daily_closures
     set status      = 'flagged',
         remarks     = p_note,
         approved_by = v_uid,
         approved_at = now()
   where closure_date = p_date and status = 'pending_approval'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'No pending submission found for %', p_date;
  end if;

  -- Notify the secretary that the day needs changes.
  insert into public.notifications (recipient_role, type, title, body, link_url)
  values ('secretary', 'end_of_day',
          'End of day flagged — changes needed',
          to_char(p_date, 'FMDay DD Mon') || ' was flagged: ' || p_note,
          '/records');
  return v_row;
end;
$$;

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
        submitted_at    = now(),
        -- Resubmitting clears any prior manager flag (#101): drop the flag
        -- note and the stale reviewer stamp so the day comes back clean.
        remarks         = null,
        approved_by     = null,
        approved_at     = null
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
