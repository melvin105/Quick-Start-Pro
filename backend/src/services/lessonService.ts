import { Pool, PoolClient } from 'pg';
import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';

const LESSON_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;
type LessonStatus = (typeof LESSON_STATUSES)[number];

export interface ScheduleLessonInput {
  studentId: string;
  instructorId: string;
  vehicleId?: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateLessonInput {
  status?: string;
  notes?: string;
}

export interface ListLessonsQuery {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  instructorId?: string;
  studentId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ActingUser {
  id: string;
  role: 'manager' | 'secretary';
}

function assertStatus(value: string): asserts value is LessonStatus {
  if (!(LESSON_STATUSES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `status must be one of: ${LESSON_STATUSES.join(', ')}`);
  }
}

async function fetchLesson(client: Pool | PoolClient, lessonId: string) {
  const { rows } = await client.query(
    `select
       ls.id, ls.lesson_date, ls.start_time, ls.end_time, ls.status, ls.notes,
       ls.created_at, ls.updated_at,
       st.id as student_id, st.student_number, st.first_name || ' ' || st.last_name as student_name,
       sf.id as instructor_id, sf.first_name || ' ' || sf.last_name as instructor_name,
       v.id as vehicle_id, v.reg_no as vehicle_reg_no
     from public.lesson_schedule ls
     join public.students st on st.id = ls.student_id
     join public.staff sf on sf.id = ls.instructor_id
     left join public.vehicles v on v.id = ls.vehicle_id
     where ls.id = $1`,
    [lessonId],
  );
  return rows[0] ?? null;
}

export async function scheduleLesson(input: ScheduleLessonInput, actingUser: ActingUser) {
  const { studentId, instructorId, vehicleId, lessonDate, startTime, endTime, notes } = input;

  if (!studentId || !instructorId || !lessonDate || !startTime || !endTime) {
    throw new ApiError(
      400,
      'INVALID_INPUT',
      'studentId, instructorId, lessonDate, startTime and endTime are required.',
    );
  }
  if (startTime >= endTime) {
    throw new ApiError(400, 'INVALID_INPUT', 'endTime must be after startTime.');
  }

  const { rows: studentRows } = await pool.query(`select id from public.students where id = $1`, [studentId]);
  if (!studentRows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
  }

  const { rows: instructorRows } = await pool.query(
    `select id from public.staff where id = $1 and role = 'instructor'`,
    [instructorId],
  );
  if (!instructorRows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Instructor not found.');
  }

  if (vehicleId) {
    const { rows: vehicleRows } = await pool.query(`select id from public.vehicles where id = $1`, [vehicleId]);
    if (!vehicleRows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Vehicle not found.');
    }
  }

  // Prevent double-booking: the same instructor (or vehicle) can't have two
  // overlapping *scheduled* lessons on the same date.
  const conflictParams: unknown[] = [lessonDate, startTime, endTime, instructorId];
  const targets = [`ls.instructor_id = $4`];
  if (vehicleId) {
    conflictParams.push(vehicleId);
    targets.push(`ls.vehicle_id = $${conflictParams.length}`);
  }
  const { rows: conflictRows } = await pool.query(
    `select id from public.lesson_schedule ls
     where ls.lesson_date = $1
       and ls.status = 'scheduled'
       and ls.start_time < $3
       and ls.end_time > $2
       and (${targets.join(' or ')})
     limit 1`,
    conflictParams,
  );
  if (conflictRows[0]) {
    throw new ApiError(409, 'SCHEDULE_CONFLICT', 'Instructor or vehicle is already booked for an overlapping time.');
  }

  return withUserContext(actingUser.id, async (client) => {
    const { rows } = await client.query(
      `insert into public.lesson_schedule
         (student_id, instructor_id, vehicle_id, lesson_date, start_time, end_time, notes)
       values ($1, $2, $3, $4, $5, $6, $7)
       returning id`,
      [studentId, instructorId, vehicleId ?? null, lessonDate, startTime, endTime, notes ?? null],
    );
    return fetchLesson(client, rows[0].id);
  });
}

export async function listLessons(query: ListLessonsQuery) {
  const { date, dateFrom, dateTo, instructorId, studentId, status } = query;
  if (status) assertStatus(status);

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (date) {
    params.push(date);
    conditions.push(`ls.lesson_date = $${params.length}`);
  }
  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`ls.lesson_date >= $${params.length}`);
  }
  if (dateTo) {
    params.push(dateTo);
    conditions.push(`ls.lesson_date <= $${params.length}`);
  }
  if (instructorId) {
    params.push(instructorId);
    conditions.push(`ls.instructor_id = $${params.length}`);
  }
  if (studentId) {
    params.push(studentId);
    conditions.push(`ls.student_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`ls.status = $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  const baseFrom = `
    from public.lesson_schedule ls
    join public.students st on st.id = ls.student_id
    join public.staff sf on sf.id = ls.instructor_id
    left join public.vehicles v on v.id = ls.vehicle_id
  `;

  const { rows: countRows } = await pool.query(`select count(*)::int as total ${baseFrom} ${where}`, params);
  const total = countRows[0].total;

  params.push(limit, offset);
  const { rows } = await pool.query(
    `select
       ls.id, ls.lesson_date, ls.start_time, ls.end_time, ls.status, ls.notes,
       st.id as student_id, st.student_number, st.first_name || ' ' || st.last_name as student_name,
       sf.id as instructor_id, sf.first_name || ' ' || sf.last_name as instructor_name,
       v.id as vehicle_id, v.reg_no as vehicle_reg_no
     ${baseFrom}
     ${where}
     order by ls.lesson_date desc, ls.start_time desc
     limit $${params.length - 1} offset $${params.length}`,
    params,
  );

  return { lessons: rows, total, page, limit };
}

export async function updateLesson(id: string, input: UpdateLessonInput, actingUser: ActingUser) {
  if (input.status !== undefined) assertStatus(input.status);

  const fieldMap: Record<string, unknown> = {
    status: input.status,
    notes: input.notes,
  };

  const setClauses: string[] = [];
  const params: unknown[] = [];
  for (const [column, value] of Object.entries(fieldMap)) {
    if (value !== undefined) {
      params.push(value);
      setClauses.push(`${column} = $${params.length}`);
    }
  }
  if (setClauses.length === 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'No updatable fields provided.');
  }

  return withUserContext(actingUser.id, async (client) => {
    params.push(id);
    const { rows } = await client.query(
      `update public.lesson_schedule set ${setClauses.join(', ')} where id = $${params.length} returning id`,
      params,
    );
    if (!rows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Lesson not found.');
    }
    return fetchLesson(client, id);
  });
}
