-- Expand v_student_profile so the secretary edit form can pre-fill every
-- editable field. The aggregate view was built for the read-only profile
-- screen and exposed only the concatenated student_name; editing needs the raw
-- first/last name, date of birth, gender, and Ghana card number (all already
-- columns on public.students). Purely additive: `create or replace view` keeps
-- the existing columns in place and appends the new ones at the end.
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
  -- appended for the edit form (order-preserving create-or-replace):
  s.first_name,
  s.last_name,
  s.dob,
  s.gender,
  s.ghana_card_no
from public.students s
left join public.v_student_balances bal on bal.id = s.id
left join public.v_lessons_remaining lr on lr.student_id = s.id
left join public.licence_tracking lt on lt.student_id = s.id;
