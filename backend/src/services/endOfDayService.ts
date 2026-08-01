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

// pg returns `numeric` columns as strings (they can exceed float precision),
// not JS numbers — convert the amount fields before they reach the API
// response, matching the convention already used in reportService.
const NUMERIC_FIELDS = ['opening_balance', 'total_income', 'total_expenses', 'closing_balance'] as const;
function normalizeClosure<T extends Record<string, unknown>>(row: T) {
  const result: Record<string, unknown> = { ...row };
  for (const field of NUMERIC_FIELDS) {
    if (result[field] !== null && result[field] !== undefined) {
      result[field] = Number(result[field]);
    }
  }
  return result;
}

// approve_end_of_day() raises a plain exception when there is nothing
// pending for the given date — translate that into a clean 404.
function isNoPendingSubmissionError(err: unknown): err is Error {
  return err instanceof Error && /No pending submission found/.test(err.message);
}

// submit_end_of_day() (migration 14) raises a plain exception when the day
// is already closed — translate that into a clean 409.
function isAlreadyClosedError(err: unknown): err is Error {
  return err instanceof Error && /already been approved and closed/.test(err.message);
}

export async function submitEndOfDay(dateInput: unknown, actingUser: ActingUser) {
  const date = resolveDate(dateInput);
  try {
    return await withUserContext(actingUser.id, async (client) => {
      const { rows } = await client.query(`select * from public.submit_end_of_day($1)`, [date]);
      return normalizeClosure(rows[0]);
    });
  } catch (err) {
    if (isAlreadyClosedError(err)) {
      throw new ApiError(409, 'DAY_ALREADY_CLOSED', `${date} has already been approved and closed.`);
    }
    throw err;
  }
}

export async function approveEndOfDay(dateInput: unknown, actingUser: ActingUser) {
  const date = resolveDate(dateInput);
  try {
    return await withUserContext(actingUser.id, async (client) => {
      const { rows } = await client.query(`select * from public.approve_end_of_day($1)`, [date]);
      return normalizeClosure(rows[0]);
    });
  } catch (err) {
    if (isNoPendingSubmissionError(err)) {
      throw new ApiError(404, 'NOT_FOUND', `No pending submission found for ${date}.`);
    }
    throw err;
  }
}

// The manager flags a submitted day back to the secretary with a required note
// (reject_end_of_day, migration 16). Like approve, it only acts on a day that
// is pending_approval and raises the same "No pending submission" exception
// otherwise — mapped to 404 here.
export async function rejectEndOfDay(dateInput: unknown, noteInput: unknown, actingUser: ActingUser) {
  const date = resolveDate(dateInput);
  const note = typeof noteInput === 'string' ? noteInput.trim() : '';
  if (!note) {
    throw new ApiError(400, 'INVALID_INPUT', 'A note explaining why the day is flagged is required.');
  }
  try {
    return await withUserContext(actingUser.id, async (client) => {
      const { rows } = await client.query(`select * from public.reject_end_of_day($1, $2)`, [date, note]);
      return normalizeClosure(rows[0]);
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
  if (status && !['open', 'pending_approval', 'closed', 'flagged'].includes(status)) {
    throw new ApiError(400, 'INVALID_INPUT', 'status must be one of: open, pending_approval, closed, flagged');
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
  return rows.map(normalizeClosure);
}

