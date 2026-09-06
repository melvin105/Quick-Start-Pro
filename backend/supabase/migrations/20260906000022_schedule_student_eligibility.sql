-- Only active students whose enrolment includes driving lessons may appear on
-- the recurring lesson timetable. Clean up invalid historical assignments
-- before enforcing the rule for every future database write.

begin;

update public.slot_assignments sa
set is_active = false
from public.students st
where st.id = sa.student_id
  and sa.is_active
  and (st.status <> 'active' or st.enrolment_type = 'licence_only');

create or replace function public.enforce_slot_assignment_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  student_status public.student_status;
  student_enrolment public.enrolment_type;
begin
  if not new.is_active then
    return new;
  end if;

  select status, enrolment_type
  into student_status, student_enrolment
  from public.students
  where id = new.student_id;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'Student not found for schedule assignment.';
  end if;

  if student_status <> 'active' then
    raise exception using
      errcode = '23514',
      message = 'Only active students can be assigned a lesson schedule.';
  end if;

  if student_enrolment = 'licence_only' then
    raise exception using
      errcode = '23514',
      message = 'Licence-only students cannot be assigned driving lesson schedules.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_slot_assignment_eligibility on public.slot_assignments;
create trigger trg_slot_assignment_eligibility
before insert or update of student_id, is_active
on public.slot_assignments
for each row execute function public.enforce_slot_assignment_eligibility();

commit;
