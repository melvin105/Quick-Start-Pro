-- ============================================================
-- DrivePro / Quick Start Pro — 06_client_feedback_updates.sql  (run SIXTH)
-- Changes driven by the 2026-07 meeting with the school owner:
--   granular licence pipeline, enrolment type (D/L/DL),
--   vehicle-linked expenses, driver attribution on attendance,
--   one-query student profile, and closing a real permissions gap
--   (secretary could delete payments to route around the
--   students-delete restriction and reissue receipts)
-- ============================================================

-- ============================================================
-- 1. ENROLMENT TYPE (Driving only / Licence only / Driving + Licence)
--    Gates whether the licence pipeline applies to a student at all.
-- ============================================================
create type enrolment_type as enum ('driving_only', 'licence_only', 'driving_and_licence');

alter table public.students
  add column enrolment_type enrolment_type not null default 'driving_and_licence';

-- ============================================================
-- 2. LICENCE TRACKING — replace the single "stage" enum with
--    explicit, independently-dated fields. The client needs to see
--    eye test, learner licence, a future-dated exam date, and the
--    exam result all at once — a single "current stage" column
--    can't hold that (advancing it would overwrite earlier data).
-- ============================================================
create type licence_exam_result as enum ('pending', 'passed', 'failed');

alter table public.licence_tracking
  add column eye_test_done          boolean not null default false,
  add column eye_test_date          date,
  add column learner_licence_issued boolean not null default false,
  add column learner_licence_date   date,
  add column exam_date              date,
  add column exam_result            licence_exam_result not null default 'pending',
  add column licence_issued         boolean not null default false,
  add column licence_issued_date    date;

-- Best-effort migration of existing rows from the old stage enum
update public.licence_tracking
set eye_test_done          = stage in ('learner_permit','theory_test','practical_test','licence_issued'),
    learner_licence_issued = stage in ('learner_permit','theory_test','practical_test','licence_issued'),
    exam_result             = case when stage = 'licence_issued' then 'passed'::licence_exam_result
                                    else 'pending'::licence_exam_result end,
    licence_issued          = stage = 'licence_issued',
    licence_issued_date     = case when stage = 'licence_issued' then updated_at::date end;

-- CASCADE: v_dashboard_stats (defined in an earlier migration) still
-- references this column. It's redefined without the dependency later
-- in this same migration (see "8. DASHBOARD STATS" below), so the
-- CASCADE-dropped view is safely recreated before this transaction ends.
alter table public.licence_tracking drop column stage cascade;
drop type licence_stage;

-- One licence record per student
alter table public.licence_tracking
  add constraint uq_licence_student unique (student_id);

create trigger trg_touch_licence before update on public.licence_tracking
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 3. EXPENSES — trace fuel/maintenance costs to one of the vehicles
-- ============================================================
alter table public.expenses
  add column vehicle_id uuid references public.vehicles (id) on delete set null;

create index idx_expenses_vehicle on public.expenses (vehicle_id);

-- ============================================================
-- 4. ATTENDANCE — driver/instructor attribution, for the
--    "lessons per driver" report (e.g. Total 100, Oku 40, Isaac 20)
-- ============================================================
alter table public.attendance
  add column driver_id uuid references public.staff (id);

create index idx_attendance_driver on public.attendance (driver_id);

create or replace view public.v_lessons_per_driver as
select
  sf.id                            as driver_id,
  sf.first_name || ' ' || sf.last_name as driver_name,
  count(*)                         as lessons_taken
from public.attendance a
join public.staff sf on sf.id = a.driver_id
where a.status in ('present', 'late')
group by sf.id, sf.first_name, sf.last_name
order by lessons_taken desc;

-- ============================================================
-- 5. COURSE DURATION — the school deliberately does not promise a
--    fixed timeline ("6 weeks"); lesson count is the real commitment.
--    Make duration optional instead of ripping out the column.
-- ============================================================
alter table public.driving_packages
  alter column duration_weeks drop not null;

alter table public.driving_packages
  drop constraint driving_packages_duration_weeks_check;
alter table public.driving_packages
  add constraint driving_packages_duration_weeks_check
    check (duration_weeks is null or duration_weeks > 0);

-- ============================================================
-- 6. STUDENT PROFILE — one query for the "at a glance" screen:
--    payments, registration date, lessons taken, licence status
-- ============================================================
create or replace view public.v_student_profile as
select
  s.id,
  s.student_number,
  s.first_name || ' ' || s.last_name as student_name,
  s.status,
  s.enrolment_type,
  s.registration_date,
  s.phone,
  s.email,
  s.address,
  s.emergency_contact,
  s.photo_url,
  coalesce(bal.total_fees, 0)       as total_fees,
  coalesce(bal.total_paid, 0)       as total_paid,
  coalesce(bal.balance, 0)          as balance,
  coalesce(lr.total_lessons, 0)     as total_lessons,
  coalesce(lr.lessons_used, 0)      as lessons_used,
  coalesce(lr.lessons_left, 0)      as lessons_left,
  lt.eye_test_done,
  lt.eye_test_date,
  lt.learner_licence_issued,
  lt.learner_licence_date,
  lt.exam_date,
  lt.exam_result,
  lt.licence_issued,
  lt.licence_issued_date
from public.students s
left join public.v_student_balances bal on bal.id = s.id
left join public.v_lessons_remaining lr on lr.student_id = s.id
left join public.licence_tracking lt on lt.student_id = s.id;

-- ============================================================
-- 7. LICENCE PIPELINE REPORT — "compile me those whose learner
--    licence has not been done", with summary counts
-- ============================================================
create or replace view public.v_licence_pipeline as
select
  s.id,
  s.student_number,
  s.first_name || ' ' || s.last_name as student_name,
  s.enrolment_type,
  lt.eye_test_done,
  lt.eye_test_date,
  lt.learner_licence_issued,
  lt.learner_licence_date,
  lt.exam_date,
  lt.exam_result,
  lt.licence_issued,
  lt.licence_issued_date
from public.students s
left join public.licence_tracking lt on lt.student_id = s.id
where s.enrolment_type in ('licence_only', 'driving_and_licence');

create or replace view public.v_licence_summary as
select
  count(*)                                                            as total_registered,
  count(*) filter (where not coalesce(learner_licence_issued, false)) as learner_pending,
  count(*) filter (where coalesce(learner_licence_issued, false)
                     and not coalesce(licence_issued, false))         as awaiting_licence,
  count(*) filter (where coalesce(licence_issued, false))             as licence_issued
from public.v_licence_pipeline;

-- ============================================================
-- 8. DASHBOARD STATS — stop counting from lesson_progress (never
--    populated; attendance is the real "lessons done" record) and
--    from the now-removed licence_stage enum
-- ============================================================
create or replace view public.v_dashboard_stats as
select
  (select count(*) from public.students)                                     as total_students,
  (select count(*) from public.students where status = 'active')             as active_students,
  (select coalesce(sum(amount),0) from public.payments
     where date_trunc('month', payment_date) = date_trunc('month', now()))  as revenue_this_month,
  (select coalesce(sum(balance),0) from public.v_student_balances
     where balance > 0)                                                     as outstanding_balances,
  (select count(*) from public.attendance
     where status in ('present','late')
       and date_trunc('month', attendance_date) = date_trunc('month', now())) as lessons_completed,
  (select count(*) from public.licence_tracking where licence_issued)       as licences_issued,
  (select count(*) from public.lesson_schedule
     where lesson_date >= current_date and status='scheduled')              as upcoming_lessons,
  (select coalesce(sum(amount),0) from public.expenses
     where date_trunc('month', expense_date) = date_trunc('month', now())) as expenses_this_month;

-- ============================================================
-- 9. CLOSE A PERMISSIONS GAP (real incident, not hypothetical)
--    Client described a secretary deleting and recreating student
--    profiles to force fresh receipt numbers after direct editing
--    was blocked. `payments.student_id` already uses ON DELETE
--    RESTRICT, which should prevent that — but the secretary policy
--    below was `for all`, meaning she could delete the payments
--    first to clear the way, then delete the student. Nothing in
--    role_permissions ever granted secretaries payments.delete or
--    students.delete (students.delete is explicitly false there);
--    RLS just wasn't enforcing it. Tightening it here to match what
--    was already decided.
-- ============================================================
drop policy if exists sec_pay on public.payments;
create policy sec_pay_read on public.payments
  for select using (public.get_my_role() = 'secretary');
create policy sec_pay_insert on public.payments
  for insert with check (public.get_my_role() = 'secretary');
create policy sec_pay_update on public.payments
  for update using (public.get_my_role() = 'secretary')
  with check (public.get_my_role() = 'secretary');
-- No delete policy for secretary: only the manager (mgr_pay, for all) can delete a payment.

drop policy if exists sec_students on public.students;
create policy sec_students_read on public.students
  for select using (public.get_my_role() = 'secretary');
create policy sec_students_insert on public.students
  for insert with check (public.get_my_role() = 'secretary');
create policy sec_students_update on public.students
  for update using (public.get_my_role() = 'secretary')
  with check (public.get_my_role() = 'secretary');
-- No delete policy for secretary: only the manager (mgr_students, for all) can delete a student.
