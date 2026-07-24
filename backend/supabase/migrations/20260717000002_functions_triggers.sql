-- ============================================================
-- DrivePro — 02_functions_triggers.sql  (run SECOND)
-- Auto-numbering, updated_at maintenance, audit logging, views
-- ============================================================

-- ---------- SEQUENCES ----------
create sequence if not exists student_number_seq start 1;
create sequence if not exists receipt_number_seq start 1;

-- ---------- AUTO STUDENT NUMBER: DP-2026-0001 ----------
create or replace function public.set_student_number()
returns trigger
language plpgsql
as $$
begin
  if new.student_number is null then
    new.student_number :=
      'DP-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('student_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger trg_student_number
before insert on public.students
for each row execute function public.set_student_number();

-- ---------- AUTO RECEIPT ON EVERY PAYMENT: RCT-000001 ----------
create or replace function public.create_receipt_for_payment()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.receipts (payment_id, receipt_no)
  values (
    new.id,
    'RCT-' || lpad(nextval('receipt_number_seq')::text, 6, '0')
  );
  return new;
end;
$$;

create trigger trg_auto_receipt
after insert on public.payments
for each row execute function public.create_receipt_for_payment();

-- ---------- UPDATED_AT MAINTENANCE ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_touch_staff       before update on public.staff            for each row execute function public.touch_updated_at();
create trigger trg_touch_users       before update on public.users            for each row execute function public.touch_updated_at();
create trigger trg_touch_students    before update on public.students         for each row execute function public.touch_updated_at();
create trigger trg_touch_packages    before update on public.driving_packages for each row execute function public.touch_updated_at();
create trigger trg_touch_vehicles    before update on public.vehicles         for each row execute function public.touch_updated_at();
create trigger trg_touch_schedule    before update on public.lesson_schedule  for each row execute function public.touch_updated_at();
create trigger trg_touch_progress    before update on public.lesson_progress  for each row execute function public.touch_updated_at();

-- ---------- GENERIC AUDIT LOGGING ----------
-- Records who changed what, with before/after snapshots.
create or replace function public.audit_changes()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_logs (user_id, table_name, record_id, action, old_data, new_data)
  values (
    auth.uid(),
    tg_table_name,
    coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id')),
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

-- Attach auditing to the sensitive tables
create trigger trg_audit_students  after insert or update or delete on public.students         for each row execute function public.audit_changes();
create trigger trg_audit_payments  after insert or update or delete on public.payments         for each row execute function public.audit_changes();
create trigger trg_audit_staff     after insert or update or delete on public.staff            for each row execute function public.audit_changes();
create trigger trg_audit_licence   after insert or update or delete on public.licence_tracking for each row execute function public.audit_changes();
create trigger trg_audit_expenses  after insert or update or delete on public.expenses         for each row execute function public.audit_changes();
create trigger trg_audit_packages  after insert or update or delete on public.student_packages for each row execute function public.audit_changes();

-- ---------- REPORTING VIEWS ----------

-- Total fees vs total paid vs balance, per student
create or replace view public.v_student_balances as
select
  s.id,
  s.student_number,
  s.first_name || ' ' || s.last_name        as student_name,
  s.status,
  coalesce(fees.total_fees, 0)              as total_fees,
  coalesce(paid.total_paid, 0)              as total_paid,
  coalesce(fees.total_fees, 0)
    - coalesce(paid.total_paid, 0)          as balance
from public.students s
left join (
  select sp.student_id, sum(dp.total_fee) as total_fees
  from public.student_packages sp
  join public.driving_packages dp on dp.id = sp.package_id
  group by sp.student_id
) fees on fees.student_id = s.id
left join (
  select p.student_id, sum(p.amount) as total_paid
  from public.payments p
  group by p.student_id
) paid on paid.student_id = s.id;

-- Monthly revenue
create or replace view public.v_monthly_revenue as
select
  to_char(payment_date, 'YYYY-MM') as month,
  count(*)                         as payment_count,
  sum(amount)                      as total_revenue
from public.payments
group by 1
order by 1 desc;

-- Upcoming lessons with names joined in
create or replace view public.v_upcoming_lessons as
select
  ls.id,
  ls.lesson_date,
  ls.start_time,
  ls.end_time,
  ls.status,
  st.student_number,
  st.first_name || ' ' || st.last_name as student_name,
  sf.first_name || ' ' || sf.last_name as instructor_name,
  v.reg_no                             as vehicle
from public.lesson_schedule ls
join public.students st on st.id = ls.student_id
join public.staff    sf on sf.id = ls.instructor_id
left join public.vehicles v on v.id = ls.vehicle_id
where ls.lesson_date >= current_date
  and ls.status = 'scheduled'
order by ls.lesson_date, ls.start_time;

-- Manager dashboard stats in one call:  select * from v_dashboard_stats;
create or replace view public.v_dashboard_stats as
select
  (select count(*) from public.students)                                        as total_students,
  (select count(*) from public.students where status = 'active')                as active_students,
  (select coalesce(sum(amount),0) from public.payments
     where date_trunc('month', payment_date) = date_trunc('month', now()))     as revenue_this_month,
  (select coalesce(sum(balance),0) from public.v_student_balances
     where balance > 0)                                                        as outstanding_balances,
  (select count(*) from public.lesson_progress where completed)                as lessons_completed,
  (select count(*) from public.licence_tracking where stage='licence_issued')  as licences_issued,
  (select count(*) from public.lesson_schedule
     where lesson_date >= current_date and status='scheduled')                 as upcoming_lessons,
  (select coalesce(sum(amount),0) from public.expenses
     where date_trunc('month', expense_date) = date_trunc('month', now()))     as expenses_this_month;
