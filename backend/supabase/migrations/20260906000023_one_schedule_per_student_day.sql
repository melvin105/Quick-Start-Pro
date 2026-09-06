-- A student may hold at most one active recurring lesson slot on a weekday.
-- Keep the earliest assignment if historical data already contains duplicates,
-- then protect every future insert/reactivation (including direct DB writes).

begin;

with ranked_assignments as (
  select
    sa.id,
    row_number() over (
      partition by sa.student_id, sl.day_of_week
      order by sa.assigned_date, sa.created_at, sa.id
    ) as occurrence
  from public.slot_assignments sa
  join public.schedule_slots sl on sl.id = sa.slot_id
  where sa.is_active
)
update public.slot_assignments sa
set is_active = false
from ranked_assignments ranked
where ranked.id = sa.id
  and ranked.occurrence > 1;

create or replace function public.enforce_one_slot_per_student_day()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_day integer;
begin
  if not new.is_active then
    return new;
  end if;

  select day_of_week
  into target_day
  from public.schedule_slots
  where id = new.slot_id;

  if not found then
    raise exception using
      errcode = '23503',
      message = 'Schedule slot not found.';
  end if;

  -- Match the backend's lock key so concurrent API and direct-database writes
  -- for the same student and weekday are serialized consistently.
  perform pg_advisory_xact_lock(
    hashtextextended('student-day:' || new.student_id::text || ':' || target_day::text, 0)
  );

  if exists (
    select 1
    from public.slot_assignments sa
    join public.schedule_slots sl on sl.id = sa.slot_id
    where sa.student_id = new.student_id
      and sa.is_active
      and sl.day_of_week = target_day
      and sa.id <> new.id
  ) then
    raise exception using
      errcode = '23505',
      message = 'Student already has an active schedule on this day.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_one_slot_per_student_day on public.slot_assignments;
create trigger trg_one_slot_per_student_day
before insert or update of slot_id, student_id, is_active
on public.slot_assignments
for each row execute function public.enforce_one_slot_per_student_day();

commit;
