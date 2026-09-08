import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';

const ATTENDANCE_STATUSES = ['present', 'absent', 'late', 'excused'] as const;
type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

const CHECKIN_METHODS = ['self_qr', 'manual'] as const;
type CheckinMethod = (typeof CHECKIN_METHODS)[number];

export interface MarkAttendanceInput {
  studentId: string;
  status: string;
  method?: string;
  isWalkIn?: boolean;
  slotId?: string;
  driverId?: string;
  checkInTime?: string;
  attendanceDate?: string;
  notes?: string;
}

export interface ListAttendanceQuery {
  date?: string;
  status?: string;
}

function assertStatus(value: string): asserts value is AttendanceStatus {
  if (!(ATTENDANCE_STATUSES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `status must be one of: ${ATTENDANCE_STATUSES.join(', ')}`);
  }
}

function assertMethod(value: string): asserts value is CheckinMethod {
  if (!(CHECKIN_METHODS as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `method must be one of: ${CHECKIN_METHODS.join(', ')}`);
  }
}

const SELECT_ATTENDANCE = `
  select
    a.id, a.student_id, a.attendance_date, a.slot_id, a.check_in_time, a.method,
    a.status, a.is_walk_in, a.auto_marked, a.notes, a.driver_id, a.marked_by, a.created_at,
    st.student_number, st.first_name || ' ' || st.last_name as student_name,
    sl.start_time, sl.end_time,
    drv.first_name || ' ' || drv.last_name as driver_name
  from public.attendance a
  join public.students st on st.id = a.student_id
  left join public.schedule_slots sl on sl.id = a.slot_id
  left join public.staff drv on drv.id = a.driver_id
`;

export async function materializeExpiredAbsences() {
  const { rows } = await pool.query<{ marked_count: number }>(
    `select public.mark_expired_attendance_absent() as marked_count`,
  );
  return Number(rows[0]?.marked_count ?? 0);
}

export async function markAttendance(input: MarkAttendanceInput, actingUserId: string) {
  const { studentId, status } = input;
  if (!studentId || !status) {
    throw new ApiError(400, 'INVALID_INPUT', 'studentId and status are required.');
  }
  assertStatus(status);

  const method = input.method ?? 'manual';
  assertMethod(method);

  const targetDate = input.attendanceDate ?? new Date().toISOString().slice(0, 10);

  const { rows: studentRows } = await pool.query(`select id from public.students where id = $1`, [studentId]);
  if (!studentRows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
  }

  const { rows: scheduledSlots } = await pool.query<{ id: string }>(
    `select sl.id
     from public.slot_assignments sa
     join public.schedule_slots sl on sl.id = sa.slot_id
     where sa.student_id = $1
       and sa.is_active
       and sl.is_active
       and sl.day_of_week = extract(isodow from $2::date)
     order by sl.start_time
     limit 1`,
    [studentId, targetDate],
  );
  const scheduledSlot = scheduledSlots[0];
  if (!scheduledSlot) {
    throw new ApiError(
      409,
      'NOT_SCHEDULED',
      'Attendance can only be marked for a student scheduled on this date.',
    );
  }
  if (input.slotId && input.slotId !== scheduledSlot.id) {
    throw new ApiError(409, 'SLOT_MISMATCH', 'The selected slot is not this student’s schedule for the date.');
  }

  if (input.driverId) {
    const { rows: driverRows } = await pool.query(
      `select id from public.staff where id = $1 and role = 'instructor'`,
      [input.driverId],
    );
    if (!driverRows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Driver (instructor) not found.');
    }
  }

  const checkInTime = status === 'absent' || status === 'excused'
    ? null
    : input.checkInTime ?? new Date().toISOString();

  return withUserContext(actingUserId, async (client) => {
    const { rows } = await client.query(
      `insert into public.attendance
         (student_id, attendance_date, slot_id, check_in_time, method, status, is_walk_in, driver_id, marked_by, notes, auto_marked)
       values ($1, $2, $3, $4, $5, $6, false, $7, $8, $9, false)
       on conflict (student_id, attendance_date) do update set
         slot_id       = excluded.slot_id,
         check_in_time = excluded.check_in_time,
         method        = excluded.method,
         status        = excluded.status,
         is_walk_in    = excluded.is_walk_in,
         driver_id     = excluded.driver_id,
         marked_by     = excluded.marked_by,
         notes         = excluded.notes,
         auto_marked   = false
       returning id`,
      [
        studentId,
        targetDate,
        scheduledSlot.id,
        checkInTime,
        method,
        status,
        input.driverId ?? null,
        actingUserId,
        input.notes ?? null,
      ],
    );
    const { rows: full } = await client.query(`${SELECT_ATTENDANCE} where a.id = $1`, [rows[0].id]);
    return full[0];
  });
}

export async function listAttendance(query: ListAttendanceQuery) {
  const { date, status } = query;
  if (status) assertStatus(status);

  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  await materializeExpiredAbsences();

  const conditions = ['sl.id is not null'];
  const params: unknown[] = [targetDate];

  if (status) {
    params.push(status);
    conditions.push(`a.status = $${params.length}`);
  }

  const { rows } = await pool.query(
    `select
       st.id as student_id, st.student_number, st.first_name || ' ' || st.last_name as student_name,
       sl.id as slot_id, sl.start_time, sl.end_time,
       a.id as attendance_id, a.check_in_time, a.method, a.status, a.is_walk_in, a.auto_marked, a.notes,
       drv.id as driver_id, drv.first_name || ' ' || drv.last_name as driver_name,
       lr.lessons_left
     from public.students st
     left join public.slot_assignments sa
       on sa.student_id = st.id and sa.is_active
     left join public.schedule_slots sl
       on sl.id = sa.slot_id
      and sl.day_of_week = extract(isodow from $1::date)
     left join public.attendance a
       on a.student_id = st.id and a.attendance_date = $1::date
     left join public.staff drv on drv.id = a.driver_id
     left join public.v_lessons_remaining lr on lr.student_id = st.id
     where ${conditions.join(' and ')}
     order by sl.start_time nulls last, student_name`,
    params,
  );

  return { date: targetDate, attendance: rows };
}

export async function getStudentAttendanceHistory(studentId: string) {
  const { rows: studentRows } = await pool.query(`select id from public.students where id = $1`, [studentId]);
  if (!studentRows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
  }

  const { rows } = await pool.query(
    `${SELECT_ATTENDANCE}
     where a.student_id = $1
     order by a.attendance_date desc, a.created_at desc`,
    [studentId],
  );
  return { studentId, attendance: rows };
}
