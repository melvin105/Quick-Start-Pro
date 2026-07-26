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
    a.status, a.is_walk_in, a.notes, a.driver_id, a.marked_by, a.created_at,
    st.student_number, st.first_name || ' ' || st.last_name as student_name,
    sl.start_time, sl.end_time,
    drv.first_name || ' ' || drv.last_name as driver_name
  from public.attendance a
  join public.students st on st.id = a.student_id
  left join public.schedule_slots sl on sl.id = a.slot_id
  left join public.staff drv on drv.id = a.driver_id
`;

export async function markAttendance(input: MarkAttendanceInput, actingUserId: string) {
  const { studentId, status } = input;
  if (!studentId || !status) {
    throw new ApiError(400, 'INVALID_INPUT', 'studentId and status are required.');
  }
  assertStatus(status);

  const method = input.method ?? 'manual';
  assertMethod(method);

  const { rows: studentRows } = await pool.query(`select id from public.students where id = $1`, [studentId]);
  if (!studentRows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
  }

  if (input.slotId) {
    const { rows: slotRows } = await pool.query(`select id from public.schedule_slots where id = $1`, [input.slotId]);
    if (!slotRows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Schedule slot not found.');
    }
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

  const isWalkIn = input.isWalkIn ?? !input.slotId;
  const checkInTime = input.checkInTime ?? (status === 'absent' || status === 'excused' ? null : new Date().toISOString());

  return withUserContext(actingUserId, async (client) => {
    const { rows } = await client.query(
      `insert into public.attendance
         (student_id, attendance_date, slot_id, check_in_time, method, status, is_walk_in, driver_id, marked_by, notes)
       values ($1, coalesce($2, current_date), $3, $4, $5, $6, $7, $8, $9, $10)
       on conflict (student_id, attendance_date) do update set
         slot_id       = excluded.slot_id,
         check_in_time = excluded.check_in_time,
         method        = excluded.method,
         status        = excluded.status,
         is_walk_in    = excluded.is_walk_in,
         driver_id     = excluded.driver_id,
         marked_by     = excluded.marked_by,
         notes         = excluded.notes
       returning id`,
      [
        studentId,
        input.attendanceDate ?? null,
        input.slotId ?? null,
        checkInTime,
        method,
        status,
        isWalkIn,
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

  const conditions = ['(sl.id is not null or a.id is not null)'];
  const params: unknown[] = [targetDate];

  if (status) {
    params.push(status);
    conditions.push(`a.status = $${params.length}`);
  }

  const { rows } = await pool.query(
    `select
       st.id as student_id, st.student_number, st.first_name || ' ' || st.last_name as student_name,
       sl.start_time, sl.end_time,
       a.id as attendance_id, a.check_in_time, a.method, a.status, a.is_walk_in, a.notes,
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
