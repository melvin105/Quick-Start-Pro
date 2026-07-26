-- ============================================================
-- DrivePro / Quick Start Pro — 12_student_leads.sql  (run TWELFTH)
-- Resolves issue #63. A colleague's bug report flagged two gaps
-- blocking the Students screen's Pending/Archived tabs
-- (docs/deliverables/week-3/UI-Wireframes.dc.html):
--
--   1. student_status has no value for a QR-scanned prospective
--      student mid-registration, and no value for an archived
--      (no longer active, but not specifically suspended/withdrawn)
--      student.
--   2. Nothing backs the QR self-submission flow: a prospective
--      student scans a QR code, submits just Name + Phone, and the
--      record sits in "Pending" until a staff member clicks
--      Complete -> to turn it into a full registration.
--
-- Decision (confirmed with the team): "Archived" gets its own enum
-- value rather than reusing withdrawn/suspended — those describe why
-- a student left; archived is just "no longer shown by default",
-- a distinct concept.
--
-- 'pending' is deliberately NOT added to student_status. A lead is
-- not a student yet — it lives in student_leads below and only
-- becomes a public.students row (with the normal default 'active'
-- status) once staff completes it via PATCH /api/v1/leads/:id/complete.
-- Adding an enum value nothing ever sets would just be dead schema.
-- ============================================================

alter type student_status add value 'archived';

-- ============================================================
-- STUDENT LEADS — QR self-submission drafts. Public/unauthenticated
-- inserts happen here (POST /api/v1/leads), never on public.students.
-- ============================================================
create table public.student_leads (
  id           uuid primary key default gen_random_uuid(),
  first_name   text not null,
  phone        text not null,
  submitted_at timestamptz not null default now(),
  completed    boolean not null default false,
  student_id   uuid references public.students (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index idx_leads_pending on public.student_leads (completed, submitted_at);

-- RLS is not the enforcement layer for this backend (Express uses a
-- raw pg connection and checks roles in middleware, per the existing
-- convention — see 10_payment_immutability.sql). These policies exist
-- for defense-in-depth/documentation, matching every other table.
-- There is no anon/public RLS policy: the public POST endpoint goes
-- through the same raw pg pool as everything else, which already
-- bypasses RLS entirely, so no policy is needed to allow it.
alter table public.student_leads enable row level security;

create policy mgr_leads on public.student_leads
  for all using (public.get_my_role() = 'manager') with check (public.get_my_role() = 'manager');
create policy sec_leads on public.student_leads
  for all using (public.get_my_role() = 'secretary') with check (public.get_my_role() = 'secretary');
