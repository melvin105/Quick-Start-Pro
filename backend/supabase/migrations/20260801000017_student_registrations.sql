-- ============================================================
-- DrivePro / Quick Start Pro — 17_student_registrations.sql
-- Resolves issue #104. Backs the FULL student self-registration
-- flow (frontend RegisterPage -> PendingSubmission), which is a
-- separate, richer concept from student_leads (migration 12).
--
--   * student_leads  = the minimal Name + Phone QR quick-capture.
--   * student_registrations (this table) = the full self-service
--     registration a prospective student fills in themselves
--     (personal details, next of kin, emergency contact), sitting
--     in a pending queue until a staff member approves it (adding
--     the enrolment/package at the desk) or rejects it.
--
-- We do NOT bloat student_leads with ~15 nullable columns for this;
-- the two flows are distinct in the UI and in intent. On approval a
-- normal public.students row is created via the existing
-- studentService.insertStudentRow path, so 'pending' is likewise NOT
-- a student_status value (same reasoning as migration 12).
--
-- Next-of-kin has no home on public.students (no columns), so it is
-- retained here on the registration record for staff to view during
-- review; approval maps only the fields students actually stores.
-- ============================================================

create type registration_status as enum ('pending', 'approved', 'rejected');

create table public.student_registrations (
  id               uuid primary key default gen_random_uuid(),

  -- Personal details (what the student themselves knows).
  first_name       text not null,
  last_name        text not null,
  dob              date not null,
  gender           gender_type not null,
  phone            text not null,
  email            text,
  address          text,
  photo_url        text,
  id_card_type     text,
  id_card_number   text,

  -- Next of kin (retained for staff review; not persisted to students).
  nok_name         text,
  nok_relationship text,
  nok_phone        text,
  nok_email        text,

  -- Emergency contact (collapsed into students.emergency_contact on approval).
  ec_name          text,
  ec_phone         text,
  ec_relationship  text,

  -- Review lifecycle.
  status           registration_status not null default 'pending',
  student_id       uuid references public.students (id) on delete set null,
  rejection_reason text,
  reviewed_by      uuid references public.users (id),
  reviewed_at      timestamptz,

  submitted_at     timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create index idx_student_registrations_status
  on public.student_registrations (status, submitted_at);

-- RLS is defense-in-depth only — this backend uses a raw pg pool that
-- bypasses RLS and enforces roles in Express middleware (see migration
-- 10 / 12). The public POST goes through that same pool, so no anon
-- policy is required to permit it.
alter table public.student_registrations enable row level security;

create policy mgr_registrations on public.student_registrations
  for all using (public.get_my_role() = 'manager') with check (public.get_my_role() = 'manager');
create policy sec_registrations on public.student_registrations
  for all using (public.get_my_role() = 'secretary') with check (public.get_my_role() = 'secretary');
