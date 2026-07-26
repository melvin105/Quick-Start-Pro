import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface ActingUser {
  id: string;
  role: 'manager' | 'secretary';
}

export interface ListClosuresQuery {
  status?: string;
}

function resolveDate(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return new Date().toISOString().slice(0, 10);
  }
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    throw new ApiError(400, 'INVALID_INPUT', 'date must be in YYYY-MM-DD format.');
  }
  return value;
}

// approve_end_of_day() raises a plain exception when there is nothing
// pending for the given date — translate that into a clean 404.
function isNoPendingSubmissionError(err: unknown): err is Error {
  return err instanceof Error && /No pending submission found/.test(err.message);
}

export async function submitEndOfDay(dateInput: unknown, actingUser: ActingUser) {
  const date = resolveDate(dateInput);
  return withUserContext(actingUser.id, async (client) => {
    const { rows } = await client.query(`select * from public.submit_end_of_day($1)`, [date]);
    return rows[0];
  });
}

export async function approveEndOfDay(dateInput: unknown, actingUser: ActingUser) {
  const date = resolveDate(dateInput);
  try {
    return await withUserContext(actingUser.id, async (client) => {
      const { rows } = await client.query(`select * from public.approve_end_of_day($1)`, [date]);
      return rows[0];
    });
  } catch (err) {
    if (isNoPendingSubmissionError(err)) {
      throw new ApiError(404, 'NOT_FOUND', `No pending submission found for ${date}.`);
    }
    throw err;
  }
}

export async function listClosures(query: ListClosuresQuery = {}) {
  const { status } = query;
  if (status && !['open', 'pending_approval', 'closed'].includes(status)) {
    throw new ApiError(400, 'INVALID_INPUT', 'status must be one of: open, pending_approval, closed');
  }

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';

  const { rows } = await pool.query(
    `select * from public.daily_closures ${where} order by closure_date desc`,
    params,
  );
  return rows;
}
