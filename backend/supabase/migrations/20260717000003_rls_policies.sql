-- ============================================================
-- DrivePro — 03_rls_policies.sql  (run THIRD)
-- Row-Level Security: Manager / Secretary / Instructor
-- ============================================================

-- ---------- HELPER FUNCTIONS ----------
-- Role of the currently logged-in user
create or replace function public.get_my_role()
returns user_role
language sql
stable
security definer
as $$
  select role from public.users where id = auth.uid();
$$;

-- staff.id of the currently logged-in user (for instructors)
create or replace function public.get_my_staff_id()
returns uuid
language sql
stable
security definer
as $$
  select staff_id from public.users where id = auth.uid();
$$;

-- ---------- ENABLE RLS ON ALL TABLES ----------
alter table public.users            enable row level security;
alter table public.staff            enable row level security;
alter table public.students         enable row level security;
alter table public.driving_packages enable row level security;
alter table public.student_packages enable row level security;
alter table public.payments         enable row level security;
alter table public.receipts         enable row level security;
alter table public.vehicles         enable row level security;
alter table public.lesson_schedule  enable row level security;
alter table public.lesson_progress  enable row level security;
alter table public.licence_tracking enable row level security;
alter table public.expenses         enable row level security;
alter table public.audit_logs       enable row level security;

-- ============================================================
-- USERS — everyone can read their own profile; managers manage all
-- ============================================================
create policy users_select_own on public.users
  for select using (id = auth.uid() or public.get_my_role() = 'manager');

create policy users_manager_all on public.users
  for all using (public.get_my_role() = 'manager')
  with check (public.get_my_role() = 'manager');

-- ============================================================
-- MANAGER — full access to everything
-- ============================================================
create policy mgr_staff    on public.staff            for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_students on public.students         for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_pkgs     on public.driving_packages for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_spkgs    on public.student_packages for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_pay      on public.payments         for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_rcpt     on public.receipts         for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_veh      on public.vehicles         for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_sched    on public.lesson_schedule  for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_prog     on public.lesson_progress  for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_lic      on public.licence_tracking for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');
create policy mgr_exp      on public.expenses         for all using (public.get_my_role()='manager') with check (public.get_my_role()='manager');

-- Audit logs: manager can READ ONLY (nobody can edit or delete them)
create policy mgr_audit_read on public.audit_logs
  for select using (public.get_my_role() = 'manager');

-- ============================================================
-- SECRETARY — manage students, enrolments, payments, scheduling.
-- No access to audit logs, expenses, or staff management.
-- ============================================================
create policy sec_students on public.students
  for all using (public.get_my_role()='secretary') with check (public.get_my_role()='secretary');

create policy sec_spkgs on public.student_packages
  for all using (public.get_my_role()='secretary') with check (public.get_my_role()='secretary');

create policy sec_pay on public.payments
  for all using (public.get_my_role()='secretary') with check (public.get_my_role()='secretary');

create policy sec_rcpt_read on public.receipts
  for select using (public.get_my_role()='secretary');

create policy sec_sched on public.lesson_schedule
  for all using (public.get_my_role()='secretary') with check (public.get_my_role()='secretary');

create policy sec_lic on public.licence_tracking
  for all using (public.get_my_role()='secretary') with check (public.get_my_role()='secretary');

create policy sec_pkgs_read on public.driving_packages
  for select using (public.get_my_role()='secretary');

create policy sec_veh_read on public.vehicles
  for select using (public.get_my_role()='secretary');

create policy sec_staff_read on public.staff
  for select using (public.get_my_role()='secretary');

create policy sec_prog_read on public.lesson_progress
  for select using (public.get_my_role()='secretary');

-- ============================================================
-- INSTRUCTOR — read own schedule + assigned students;
-- update lesson progress for own lessons only.
-- ============================================================
create policy ins_sched_read on public.lesson_schedule
  for select using (
    public.get_my_role()='instructor'
    and instructor_id = public.get_my_staff_id()
  );

create policy ins_students_read on public.students
  for select using (
    public.get_my_role()='instructor'
    and id in (
      select student_id from public.lesson_schedule
      where instructor_id = public.get_my_staff_id()
    )
  );

create policy ins_prog_select on public.lesson_progress
  for select using (
    public.get_my_role()='instructor'
    and instructor_id = public.get_my_staff_id()
  );

create policy ins_prog_insert on public.lesson_progress
  for insert with check (
    public.get_my_role()='instructor'
    and instructor_id = public.get_my_staff_id()
  );

create policy ins_prog_update on public.lesson_progress
  for update using (
    public.get_my_role()='instructor'
    and instructor_id = public.get_my_staff_id()
  ) with check (
    instructor_id = public.get_my_staff_id()
  );

create policy ins_veh_read on public.vehicles
  for select using (public.get_my_role()='instructor');

create policy ins_staff_read_self on public.staff
  for select using (
    public.get_my_role()='instructor'
    and id = public.get_my_staff_id()
  );
