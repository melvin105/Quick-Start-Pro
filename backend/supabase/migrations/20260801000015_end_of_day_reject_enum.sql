-- ============================================================
-- DrivePro / Quick Start Pro — 15_end_of_day_reject_enum.sql  (run FIFTEENTH)
-- Backend gap #101 — End-of-day reject/flag.
--
-- The manager review step (approve_end_of_day) could only *approve* a
-- submitted day. The UI (docs/UI_Design.html; the records store DayStatus =
-- open | submitted | approved | flagged) also lets the manager *flag* a
-- submitted day back to the secretary with a note, so it can be corrected and
-- resubmitted — but day_status had no 'flagged' value and no reject RPC.
--
-- Postgres requires a new enum value to be committed before it can be
-- referenced, so the ADD VALUE is isolated in its own migration, ahead of the
-- reject_end_of_day() function that uses it (migration 16).
-- ============================================================

alter type public.day_status add value if not exists 'flagged';
