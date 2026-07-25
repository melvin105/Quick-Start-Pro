-- ============================================================
-- DrivePro / Quick Start Pro — 05_ui_alignment.sql  (run FIFTH)
-- Aligns the backend with the App Screens UI design:
--   attendance + QR check-in, recurring weekly slots,
--   daily records & end-of-day approval, notifications,
--   settings, role permission matrix, R-#### receipts
-- ============================================================

-- ---------- NEW ENUM TYPES ----------
create type attendance_status  as enum ('present', 'absent', 'late', 'excused');
create type checkin_method     as enum ('self_qr', 'manual');
create type day_status         as enum ('open', 'pending_approval', 'closed');
create type notification_type  as enum (
  'payment_due', 'lesson_reminder', 'missed_lesson',
  'audit_alert', 'end_of_day', 'security', 'system'
);

-- ============================================================
-- 1. RECURRING WEEKLY SCHEDULE (Mon–Sat slot grid)
-- ============================================================
create table public.schedule_slots (
  id          uuid primary key default gen_random_uuid(),
  day_of_week int  not null check (day_of_week between 1 and 6),  -- 1=Mon … 6=Sat
  start_time  time not null,
  end_time    time not null,
  capacity    int  not null default 4 check (capacity > 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (day_of_week, start_time),
  constraint chk_slot_times check (end_time > start_time)
);

create table public.slot_assignments (
  id            uuid primary key default gen_random_uuid(),
  slot_id       uuid not null references public.schedule_slots (id) on delete cascade,
  student_id    uuid not null references public.students (id) on delete cascade,
  assigned_date date not null default current_date,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  unique (slot_id, student_id)
);

create index idx_slot_assign_student on public.slot_assignments (student_id);
create index idx_slot_assign_slot    on public.slot_assignments (slot_id);

-- Pre-create the standard grid: Mon–Sat, 8am–5pm hourly slots
insert into public.schedule_slots (day_of_week, start_time, end_time)
select d, make_time(h, 0, 0), make_time(h + 1, 0, 0)
from generate_series(1, 6) d, generate_series(8, 16) h;

-- ============================================================
-- 2. ATTENDANCE (QR self check-in, manual marking, walk-ins)
-- ============================================================
create table public.attendance (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students (id) on delete cascade,
  attendance_date date not null default current_date,
  slot_id         uuid references public.schedule_slots (id),   -- NULL = walk-in / no slot
  check_in_time   timestamptz,
  method          checkin_method not null default 'manual',
  status          attendance_status not null default 'present',
  is_walk_in      boolean not null default false,
  marked_by       uuid references public.users (id),            -- NULL if self check-in
  notes           text,
  created_at      timestamptz not null default now(),
  unique (student_id, attendance_date)
);

create index idx_attendance_date    on public.attendance (attendance_date);
create index idx_attendance_student on public.attendance (student_id);

-- Attendance counts toward "lessons left"
create or replace view public.v_lessons_remaining as
select
  s.id                                   as student_id,
  s.student_number,
  s.first_name || ' ' || s.last_name     as student_name,
  coalesce(pkg.total_lessons, 0)         as total_lessons,
  coalesce(att.attended, 0)              as lessons_used,
  coalesce(pkg.total_lessons, 0)
    - coalesce(att.attended, 0)          as lessons_left
from public.students s
left join (
  select sp.student_id, sum(dp.lesson_count) as total_lessons
  from public.student_packages sp
  join public.driving_packages dp on dp.id = sp.package_id
  group by sp.student_id
) pkg on pkg.student_id = s.id
left join (
  select student_id, count(*) as attended
  from public.attendance
  where status in ('present', 'late')
  group by student_id
) att on att.student_id = s.id;

-- Today's attendance screen in one query
create or replace view public.v_today_attendance as
select
  st.id                                as student_id,
  st.first_name || ' ' || st.last_name as student_name,
  sl.start_time,
  sl.end_time,
  a.check_in_time,
  a.method,
  a.status,
  a.is_walk_in,
  lr.lessons_left
from public.students st
left join public.slot_assignments sa
  on sa.student_id = st.id and sa.is_active
left join public.schedule_slots sl
  on sl.id = sa.slot_id
 and sl.day_of_week = extract(isodow from current_date)
left join public.attendance a
  on a.student_id = st.id and a.attendance_date = current_date
left join public.v_lessons_remaining lr
  on lr.student_id = st.id
where sl.id is not null or a.id is not null;

-- ============================================================
-- 3. DAILY RECORDS + END-OF-DAY WORKFLOW
--    Secretary submits → Manager approves & closes
-- ============================================================
create table public.daily_closures (
  id              uuid primary key default gen_random_uuid(),
  closure_date    date not null unique,
  opening_balance numeric(12,2) not null default 0,
  total_income    numeric(12,2) not null default 0,
  total_expenses  numeric(12,2) not null default 0,
  closing_balance numeric(12,2) not null default 0,
  status          day_status not null default 'open',
  submitted_by    uuid references public.users (id),
  submitted_at    timestamptz,
  approved_by     uuid references public.users (id),
  approved_at     timestamptz,
  remarks         text,
  created_at      timestamptz not null default now()
);

-- Unified day ledger (income + expenses interleaved) → powers the Records screen
create or replace view public.v_daily_ledger as
select
  p.payment_date                        as entry_date,
  p.created_at                          as entry_time,
  st.first_name || ' ' || st.last_name || ' (payment)' as description,
  'Income'                              as category,
  p.amount                              as income,
  null::numeric                         as expense
from public.payments p
join public.students st on st.id = p.student_id
union all
select
  e.expense_date,
  e.created_at,
  coalesce(e.description, e.category::text),
  initcap(replace(e.category::text, '_', ' ')),
  null::numeric,
  e.amount
from public.expenses e
order by entry_date, entry_time;

-- Secretary calls this to submit the day (computes totals automatically):
--   select public.submit_end_of_day(current_date);
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
     v_open + v_income - v_exp, 'pending_approval', auth.uid(), now())
  on conflict (closure_date) do update
    set opening_balance = excluded.opening_balance,
        total_income    = excluded.total_income,
        total_expenses  = excluded.total_expenses,
        closing_balance = excluded.closing_balance,
        status          = 'pending_approval',
        submitted_by    = auth.uid(),
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

-- Manager calls this to approve & close:
--   select public.approve_end_of_day(current_date);
create or replace function public.approve_end_of_day(p_date date)
returns public.daily_closures
language plpgsql
security definer
as $$
declare
  v_row public.daily_closures;
begin
  if public.get_my_role() <> 'manager' then
    raise exception 'Only the manager can approve and close a day';
  end if;

  update public.daily_closures
     set status = 'closed', approved_by = auth.uid(), approved_at = now()
   where closure_date = p_date and status = 'pending_approval'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'No pending submission found for %', p_date;
  end if;
  return v_row;
end;
$$;

-- Once a day is CLOSED, its payments and expenses are locked
create or replace function public.block_closed_day_changes()
returns trigger
language plpgsql
as $$
declare
  v_date date;
begin
  v_date := coalesce(
    (to_jsonb(new) ->> 'payment_date')::date,
    (to_jsonb(new) ->> 'expense_date')::date,
    (to_jsonb(old) ->> 'payment_date')::date,
    (to_jsonb(old) ->> 'expense_date')::date
  );
  if exists (select 1 from public.daily_closures
             where closure_date = v_date and status = 'closed') then
    raise exception 'Day % is closed and approved — records can no longer be changed', v_date;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger trg_lock_payments before insert or update or delete on public.payments
  for each row execute function public.block_closed_day_changes();
create trigger trg_lock_expenses before insert or update or delete on public.expenses
  for each row execute function public.block_closed_day_changes();

-- ============================================================
-- 4. NOTIFICATIONS
-- ============================================================
create table public.notifications (
  id             uuid primary key default gen_random_uuid(),
  recipient_role user_role,                                -- broadcast to a role…
  recipient_user uuid references public.users (id),        -- …or a specific user
  type           notification_type not null,
  title          text not null,
  body           text,
  link_url       text,
  is_read        boolean not null default false,
  created_at     timestamptz not null default now(),
  constraint chk_recipient check (recipient_role is not null or recipient_user is not null)
);

create index idx_notif_role on public.notifications (recipient_role, is_read);
create index idx_notif_user on public.notifications (recipient_user, is_read);

-- Alert the manager whenever a payment amount is EDITED (matches
-- the "Vital record edited" notification in the design)
create or replace function public.notify_payment_edit()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.amount is distinct from old.amount then
    insert into public.notifications (recipient_role, type, title, body, link_url)
    values ('manager', 'audit_alert',
            'Vital record edited — payment amount changed',
            'Amount changed from GHS ' || old.amount || ' to GHS ' || new.amount,
            '/audit-log');
  end if;
  return new;
end;
$$;

create trigger trg_notify_payment_edit
after update on public.payments
for each row execute function public.notify_payment_edit();

-- ============================================================
-- 5. SETTINGS + ROLE PERMISSION MATRIX
-- ============================================================
create table public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_by uuid references public.users (id),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value) values
  ('school_name',    '"Quick Start Driving School"'),
  ('app_name',       '"Quick Start Pro"'),
  ('business_phone', '"030 222 4455"'),
  ('address',        '"Spintex Road, Accra"'),
  ('currency',       '"GHS"');

create table public.role_permissions (
  id               uuid primary key default gen_random_uuid(),
  role             user_role not null,
  permission_key   text not null,
  allowed          boolean not null default true,
  requires_logging boolean not null default false,
  unique (role, permission_key)
);

insert into public.role_permissions (role, permission_key, allowed, requires_logging) values
  ('manager',   'students.view',              true,  false),
  ('secretary', 'students.view',              true,  false),
  ('manager',   'students.delete',            true,  false),
  ('secretary', 'students.delete',            false, false),
  ('manager',   'students.override_duplicate',true,  false),
  ('secretary', 'students.override_duplicate',true,  true),
  ('manager',   'records.record_expense',     false, false),
  ('secretary', 'records.record_expense',     true,  false),
  ('manager',   'records.submit_end_of_day',  false, false),
  ('secretary', 'records.submit_end_of_day',  true,  false),
  ('manager',   'records.approve_close_day',  true,  false),
  ('secretary', 'records.approve_close_day',  false, false),
  ('manager',   'payments.edit',              true,  false),
  ('secretary', 'payments.edit',              true,  true);

-- ============================================================
-- 6. RECEIPT FORMAT → R-0041 style (matches the design)
-- ============================================================
create or replace function public.create_receipt_for_payment()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.receipts (payment_id, receipt_no)
  values (new.id, 'R-' || lpad(nextval('receipt_number_seq')::text, 4, '0'));
  return new;
end;
$$;

-- ============================================================
-- 7. ROW-LEVEL SECURITY FOR THE NEW TABLES
-- ============================================================
alter table public.schedule_slots   enable row level security;
alter table public.slot_assignments enable row level security;
alter table public.attendance       enable row level security;
alter table public.daily_closures   enable row level security;
alter table public.notifications    enable row level security;
alter table public.app_settings     enable row level security;
alter table public.role_permissions enable row level security;

-- Manager: full access
create policy mgr_slots  on public.schedule_slots   for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_sassign on public.slot_assignments for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_att    on public.attendance       for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_close  on public.daily_closures   for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_set    on public.app_settings     for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_perm   on public.role_permissions for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');

-- Secretary: manage scheduling + attendance; submit (not close) days
create policy sec_slots_read on public.schedule_slots
  for select using (public.get_my_role()='secretary');
create policy sec_sassign on public.slot_assignments
  for all using (public.get_my_role()='secretary') with check (public.get_my_role()='secretary');
create policy sec_att on public.attendance
  for all using (public.get_my_role()='secretary') with check (public.get_my_role()='secretary');
create policy sec_close_read on public.daily_closures
  for select using (public.get_my_role()='secretary');
create policy sec_set_read on public.app_settings
  for select using (public.get_my_role()='secretary');
create policy sec_perm_read on public.role_permissions
  for select using (public.get_my_role()='secretary');

-- Notifications: you see what's addressed to you or your role
create policy notif_read on public.notifications
  for select using (
    recipient_user = auth.uid()
    or recipient_role = public.get_my_role()
  );
create policy notif_mark_read on public.notifications
  for update using (
    recipient_user = auth.uid()
    or recipient_role = public.get_my_role()
  );
