import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';
import * as lessonService from './lessonService';

const STAFF_STATUSES = ['active', 'inactive', 'suspended'] as const;
type StaffStatus = (typeof STAFF_STATUSES)[number];

export interface CreateInstructorInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  hireDate?: string;
}

export interface UpdateInstructorInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  status?: string;
}

export interface ListInstructorsQuery {
  status?: string;
  search?: string;
}

function assertStatus(value: string): asserts value is StaffStatus {
  if (!(STAFF_STATUSES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `status must be one of: ${STAFF_STATUSES.join(', ')}`);
  }
}

const SELECT_INSTRUCTOR = `
  select
    sf.id, sf.first_name, sf.last_name, sf.phone, sf.email, sf.hire_date, sf.status,
    sf.created_at, sf.updated_at,
    coalesce(lc.lessons_count, 0) as lessons_count
  from public.staff sf
  left join (
    select instructor_id, count(*) as lessons_count
    from public.lesson_schedule
    group by instructor_id
  ) lc on lc.instructor_id = sf.id
`;

export async function createInstructor(input: CreateInstructorInput, actingUserId: string) {
  const { firstName, lastName, phone, email, hireDate } = input;
  if (!firstName || !lastName || !phone) {
    throw new ApiError(400, 'INVALID_INPUT', 'firstName, lastName and phone are required.');
  }

  return withUserContext(actingUserId, async (client) => {
    const { rows } = await client.query(
      `insert into public.staff (first_name, last_name, phone, email, role, hire_date)
       values ($1, $2, $3, $4, 'instructor', coalesce($5, current_date))
       returning id`,
      [firstName, lastName, phone, email ?? null, hireDate ?? null],
    );
    const { rows: full } = await client.query(`${SELECT_INSTRUCTOR} where sf.id = $1`, [rows[0].id]);
    return full[0];
  });
}

export async function listInstructors(query: ListInstructorsQuery) {
  const { status, search } = query;
  if (status) assertStatus(status);

  const conditions = [`sf.role = 'instructor'`];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`sf.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(sf.first_name || ' ' || sf.last_name) ilike $${params.length}`);
  }

  const { rows } = await pool.query(
    `${SELECT_INSTRUCTOR} where ${conditions.join(' and ')} order by sf.first_name, sf.last_name`,
    params,
  );
  return { instructors: rows };
}

export async function getInstructorById(id: string) {
  const { rows } = await pool.query(`${SELECT_INSTRUCTOR} where sf.id = $1 and sf.role = 'instructor'`, [id]);
  if (!rows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Instructor not found.');
  }
  return rows[0];
}

export async function updateInstructor(id: string, input: UpdateInstructorInput, actingUserId: string) {
  if (input.status !== undefined) assertStatus(input.status);

  const fieldMap: Record<string, unknown> = {
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone,
    email: input.email,
    status: input.status,
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

  return withUserContext(actingUserId, async (client) => {
    params.push(id);
    const { rows } = await client.query(
      `update public.staff set ${setClauses.join(', ')} where id = $${params.length} and role = 'instructor' returning id`,
      params,
    );
    if (!rows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Instructor not found.');
    }
    const { rows: full } = await client.query(`${SELECT_INSTRUCTOR} where sf.id = $1`, [id]);
    return full[0];
  });
}

export async function getInstructorLessons(id: string, query: { date?: string; dateFrom?: string; dateTo?: string; status?: string }) {
  await getInstructorById(id);
  return lessonService.listLessons({ ...query, instructorId: id, limit: 100 });
}

// Delete semantics for #107 (documented decision): instructors are referenced
// by historical lesson_schedule (and scheduling slot_assignments) rows, so a
// blanket hard delete would break those FKs and erase history. We therefore
// SMART-DELETE: hard-delete only when the row has no dependants (e.g. a staff
// member added by mistake), otherwise fall back to a soft-deactivate
// (status = 'inactive') that keeps the historical lessons intact.
//
// Rather than hard-code every table that references staff, we attempt the
// delete inside a SAVEPOINT and treat a foreign_key_violation (SQLSTATE 23503)
// as the signal to deactivate instead — so new FKs to staff are handled
// automatically. Returns { action } telling the caller which path was taken.
export async function deleteInstructor(id: string, actingUserId: string) {
  return withUserContext(actingUserId, async (client) => {
    // Lock the row so a concurrent delete/update can't race the check below.
    const { rows } = await client.query(
      `select id from public.staff where id = $1 and role = 'instructor' for update`,
      [id],
    );
    if (!rows[0]) {
      throw new ApiError(404, 'NOT_FOUND', 'Instructor not found.');
    }

    await client.query('savepoint del_instructor');
    try {
      await client.query(`delete from public.staff where id = $1 and role = 'instructor'`, [id]);
      return { id, action: 'deleted' as const };
    } catch (err) {
      // Referenced by lessons/assignments — roll back just the failed delete and
      // deactivate instead so the history is preserved.
      if ((err as { code?: string }).code === '23503') {
        await client.query('rollback to savepoint del_instructor');
        await client.query(`update public.staff set status = 'inactive' where id = $1`, [id]);
        const { rows: fresh } = await client.query(`${SELECT_INSTRUCTOR} where sf.id = $1`, [id]);
        return { id, action: 'deactivated' as const, instructor: fresh[0] };
      }
      throw err;
    }
  });
}
