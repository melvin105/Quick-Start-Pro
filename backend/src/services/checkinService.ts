import { pool } from '../db';
import { ApiError } from '../utils/ApiError';

// Public, unauthenticated self check-in used by the QR kiosk flow.
//
// A student scans the staff-issued daily QR code, enters their phone number, optionally
// picks the instructor they are driving with, and marks themselves present.
// Because there is no logged-in user, attendance rows are written with
// marked_by = NULL (the schema documents NULL as "self check-in"), and there
// is no audit trigger on the attendance table, so these queries use the plain
// pool rather than withUserContext.

export interface LookupInput {
  phone: string;
}

export interface SelfCheckInInput {
  phone: string;
  instructorId?: string;
}

interface StudentRow {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

interface SlotRow {
  id: string;
  start_time: string;
  end_time: string;
}

// Students may register their phone in slightly different shapes
// (spaces, leading 0, +233 …). We compare on digits only, on both sides:
// the stored value via regexp_replace in SQL, the input here.
function normalizePhone(value: unknown): string {
  if (typeof value !== 'string') {
    throw new ApiError(400, 'INVALID_INPUT', 'phone is required.');
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length < 9) {
    throw new ApiError(400, 'INVALID_INPUT', 'A valid phone number is required.');
  }
  return digits;
}

function toStudent(row: StudentRow) {
  return {
    id: row.id,
    studentNumber: row.student_number,
    name: `${row.first_name} ${row.last_name}`,
    photoUrl: row.photo_url,
  };
}

function toSlot(row: SlotRow | undefined) {
  return row ? { id: row.id, startTime: row.start_time, endTime: row.end_time } : null;
}

// Find the active student whose phone (digits only) matches the input.
// Only active students can self check-in; anyone else is reported as
// not_found so we never reveal the status of a suspended/withdrawn record.
async function findActiveStudent(phone: string): Promise<StudentRow | undefined> {
  const { rows } = await pool.query<StudentRow>(
    `select id, student_number, first_name, last_name, photo_url
       from public.students
      where status = 'active'
        and regexp_replace(phone, '[^0-9]', '', 'g') = $1
      limit 1`,
    [phone],
  );
  return rows[0];
}

// The student's active slot for *today*, if they have a recurring assignment
// on this weekday. NULL means no scheduled lesson → treated as a walk-in.
async function findTodaysSlot(studentId: string): Promise<SlotRow | undefined> {
  const { rows } = await pool.query<SlotRow>(
    `select sl.id, sl.start_time, sl.end_time
       from public.slot_assignments sa
       join public.schedule_slots sl on sl.id = sa.slot_id
      where sa.student_id = $1
        and sa.is_active
        and sl.is_active
        and sl.day_of_week = extract(isodow from current_date)
      order by sl.start_time
      limit 1`,
    [studentId],
  );
  return rows[0];
}

async function findTodaysAttendance(studentId: string) {
  const { rows } = await pool.query<{ status: string; check_in_time: string | null }>(
    `select status, check_in_time
       from public.attendance
      where student_id = $1 and attendance_date = current_date`,
    [studentId],
  );
  return rows[0];
}

/**
 * Look up a student by phone and report their check-in state for today.
 * Returns a discriminated result the kiosk uses to decide what to show.
 */
export async function lookupByPhone(input: LookupInput) {
  const phone = normalizePhone(input?.phone);

  const student = await findActiveStudent(phone);
  if (!student) {
    return { status: 'not_found' as const };
  }

  const [slot, attendance] = await Promise.all([
    findTodaysSlot(student.id),
    findTodaysAttendance(student.id),
  ]);

  const base = {
    student: toStudent(student),
    scheduledToday: Boolean(slot),
    slot: toSlot(slot),
  };

  if (attendance && attendance.status === 'present') {
    return { status: 'already_checked_in' as const, checkInTime: attendance.check_in_time, ...base };
  }

  return { status: 'ok' as const, ...base };
}

/**
 * Mark a student present via self check-in. Idempotent: if the student is
 * already marked present today, the existing record is returned unchanged
 * (alreadyCheckedIn = true) instead of overwriting the original time.
 */
export async function selfCheckIn(input: SelfCheckInInput) {
  const phone = normalizePhone(input?.phone);

  const student = await findActiveStudent(phone);
  if (!student) {
    throw new ApiError(404, 'NOT_FOUND', 'No active student found with that phone number.');
  }

  // Validate the optional instructor pick. Only active instructors are offered
  // by the picker, so anything else is a stale/forged id.
  let instructorName: string | null = null;
  if (input.instructorId) {
    const { rows } = await pool.query<{ first_name: string; last_name: string }>(
      `select first_name, last_name
         from public.staff
        where id = $1 and role = 'instructor' and status = 'active'`,
      [input.instructorId],
    );
    if (!rows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Instructor not found.');
    }
    instructorName = `${rows[0].first_name} ${rows[0].last_name}`;
  }

  const slot = await findTodaysSlot(student.id);
  const isWalkIn = !slot;

  // Insert present; on conflict only overwrite if the student was NOT already
  // present (e.g. previously marked absent). The WHERE guard makes the upsert
  // return no row when they were already present, which the unique constraint
  // makes race-safe — two rapid scans can't create duplicates or double-write.
  const { rows: upserted } = await pool.query<{ check_in_time: string }>(
    `insert into public.attendance
       (student_id, attendance_date, slot_id, check_in_time, method, status, is_walk_in, driver_id, marked_by)
     values ($1, current_date, $2, now(), 'self_qr', 'present', $3, $4, null)
     on conflict (student_id, attendance_date) do update set
       slot_id       = excluded.slot_id,
       check_in_time = excluded.check_in_time,
       method        = excluded.method,
       status        = excluded.status,
       is_walk_in    = excluded.is_walk_in,
       driver_id     = excluded.driver_id
     where public.attendance.status <> 'present'
     returning check_in_time`,
    [student.id, slot?.id ?? null, isWalkIn, input.instructorId ?? null],
  );

  if (upserted[0]) {
    return {
      studentName: `${student.first_name} ${student.last_name}`,
      studentNumber: student.student_number,
      checkInTime: upserted[0].check_in_time,
      scheduledToday: Boolean(slot),
      slot: toSlot(slot),
      instructorName,
      alreadyCheckedIn: false,
    };
  }

  // No row updated → they were already present. Return the existing check-in.
  const existing = await findTodaysAttendance(student.id);
  return {
    studentName: `${student.first_name} ${student.last_name}`,
    studentNumber: student.student_number,
    checkInTime: existing?.check_in_time ?? null,
    scheduledToday: Boolean(slot),
    slot: toSlot(slot),
    instructorName,
    alreadyCheckedIn: true,
  };
}

/**
 * Active instructors for the kiosk picker. Public, so only id + name are
 * exposed — never staff phone/email.
 */
export async function listActiveInstructors() {
  const { rows } = await pool.query<{ id: string; first_name: string; last_name: string }>(
    `select id, first_name, last_name
       from public.staff
      where role = 'instructor' and status = 'active'
      order by first_name, last_name`,
  );
  return {
    instructors: rows.map((r) => ({ id: r.id, name: `${r.first_name} ${r.last_name}` })),
  };
}
