-- ============================================================
-- DrivePro / Quick Start Pro — 07_custom_auth.sql  (run SEVENTH)
-- public.users was originally 1:1 with Supabase Auth (auth.users),
-- from before the team settled on a custom Express + JWT + bcrypt
-- backend (ADR-002, ADR-004) that never calls Supabase Auth. That FK
-- blocks inserting a user row without first creating a matching
-- auth.users row, and there was nowhere to store a bcrypt hash.
-- ============================================================

alter table public.users drop constraint if exists users_id_fkey;
alter table public.users alter column id set default gen_random_uuid();

alter table public.users add column if not exists password_hash text;

-- Existing rows (manager@drivepro.test, secretary@drivepro.test) were
-- provisioned through Supabase Auth directly and have no password_hash
-- yet — the Express login endpoint treats a null hash as "account not
-- yet provisioned" and rejects the login rather than crashing on
-- bcrypt.compare(password, null). Not enforced NOT NULL here so this
-- migration stays safe to run before those rows are backfilled.
