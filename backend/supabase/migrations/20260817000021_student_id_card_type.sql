-- Preserve the identity-document type after a pending registration becomes a
-- student. Previously only the number was copied into ghana_card_no, forcing
-- the edit/profile UI to guess that every stored number was a Ghana Card.
alter table public.students
  add column if not exists id_card_type text
  check (id_card_type in ('Ghana Card', 'Voter ID', 'Passport', 'Driver''s Licence', 'Other'));

-- Existing records predate the type column and ghana_card_no historically
-- meant Ghana Card, so this is the safest backwards-compatible backfill.
update public.students
set id_card_type = 'Ghana Card'
where ghana_card_no is not null and id_card_type is null;

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
  lt.licence_issued_date,
  s.first_name,
  s.last_name,
  s.dob,
  s.gender,
  s.ghana_card_no,
  s.id_card_type
from public.students s
left join public.v_student_balances bal on bal.id = s.id
left join public.v_lessons_remaining lr on lr.student_id = s.id
left join public.licence_tracking lt on lt.student_id = s.id;
