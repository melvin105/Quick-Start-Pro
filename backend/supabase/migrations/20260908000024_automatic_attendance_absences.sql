-- Scheduled students who have not checked in by the end of their slot are
-- automatically recorded as absent. The marker distinguishes system-created
-- absences from manual ones and is cleared if staff later correct the record.

begin;

alter table public.attendance
  add column if not exists auto_marked boolean not null default false;

create or replace function public.mark_expired_attendance_absent(
  target_date date default timezone('Africa/Accra', now())::date
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  -- Recurring assignments do not provide reliable historical snapshots, so
  -- only materialize today's elapsed slots. Existing historical attendance is
  -- left untouched.
  if target_date <> timezone('Africa/Accra', now())::date then
    return 0;
  end if;

  with inserted as (
    insert into public.attendance (
      student_id,
      attendance_date,
      slot_id,
      check_in_time,
      method,
      status,
      is_walk_in,
      driver_id,
      marked_by,
      notes,
      auto_marked
    )
    select
      sa.student_id,
      target_date,
      sl.id,
      null,
      'manual',
      'absent',
      false,
      null,
      null,
      'Automatically marked absent after the scheduled slot ended.',
      true
    from public.slot_assignments sa
    join public.schedule_slots sl on sl.id = sa.slot_id
    join public.students st on st.id = sa.student_id
    where sa.is_active
      and sl.is_active
      and st.status = 'active'
      and sl.day_of_week = extract(isodow from target_date)
      and target_date + sl.end_time <= timezone('Africa/Accra', now())
    on conflict (student_id, attendance_date) do nothing
    returning 1
  )
  select count(*)::integer into affected from inserted;

  return affected;
end;
$$;

revoke execute on function public.mark_expired_attendance_absent(date)
  from public, anon, authenticated;
grant execute on function public.mark_expired_attendance_absent(date)
  to postgres;

create or replace function public.enforce_scheduled_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- QR walk-ins remain a separate supported workflow. Every non-walk-in mark
  -- must reference the student's active recurring slot for that weekday.
  if new.is_walk_in then
    return new;
  end if;

  if new.slot_id is null or not exists (
    select 1
    from public.slot_assignments sa
    join public.schedule_slots sl on sl.id = sa.slot_id
    where sa.student_id = new.student_id
      and sa.slot_id = new.slot_id
      and sa.is_active
      and sl.is_active
      and sl.day_of_week = extract(isodow from new.attendance_date)
  ) then
    raise exception using
      errcode = '23514',
      message = 'Attendance requires the student''s scheduled slot for this date.';
  end if;

  return new;
end;
$$;

revoke execute on function public.enforce_scheduled_attendance()
  from public, anon, authenticated;

drop trigger if exists trg_enforce_scheduled_attendance on public.attendance;
create trigger trg_enforce_scheduled_attendance
before insert or update of student_id, attendance_date, slot_id, is_walk_in
on public.attendance
for each row execute function public.enforce_scheduled_attendance();

create or replace view public.v_today_attendance as
select
  st.id                                as student_id,
  st.first_name || ' ' || st.last_name as student_name,
  sl.start_time,
  sl.end_time,
  a.check_in_time,
  a.method,
  a.status,
  a.is_walk_in,
  lr.lessons_left,
  a.auto_marked
from public.students st
left join public.slot_assignments sa
  on sa.student_id = st.id and sa.is_active
left join public.schedule_slots sl
  on sl.id = sa.slot_id
 and sl.day_of_week = extract(isodow from timezone('Africa/Accra', now())::date)
left join public.attendance a
  on a.student_id = st.id
 and a.attendance_date = timezone('Africa/Accra', now())::date
left join public.v_lessons_remaining lr
  on lr.student_id = st.id
where sl.id is not null;

commit;
