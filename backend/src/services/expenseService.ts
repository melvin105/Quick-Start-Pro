import { Pool, PoolClient } from 'pg';
import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';
import { normalizeNumericFields, normalizeNumericRows } from '../utils/normalizeNumeric';

// Mirrors the expense_category enum (migration 20260717000001_schema.sql).
const EXPENSE_CATEGORIES = [
  'fuel',
  'vehicle_maintenance',
  'salaries',
  'rent',
  'utilities',
  'dvla_fees',
  'stationery',
  'other',
] as const;
type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

const EXPENSE_FIELDS = ['amount'] as const;

export interface CreateExpenseInput {
  category: string;
  amount: number;
  description?: string;
  expenseDate?: string;
  vehicleId?: string;
}

export interface UpdateExpenseInput {
  category?: string;
  amount?: number;
  description?: string;
  expenseDate?: string;
  vehicleId?: string | null;
}

export interface ListExpensesQuery {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  vehicleId?: string;
  page?: number;
  limit?: number;
}

export interface ActingUser {
  id: string;
  role: 'manager' | 'secretary';
}

function assertCategory(value: string): asserts value is ExpenseCategory {
  if (!(EXPENSE_CATEGORIES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`);
  }
}

// trg_lock_expenses (block_closed_day_changes) raises a plain exception once a
// day is closed via the end-of-day workflow — translate that into a clean 423
// so the client can distinguish "day is locked" from other write failures.
function isDayLockError(err: unknown): err is Error {
  return err instanceof Error && /is closed and approved/.test(err.message);
}

async function fetchExpense(client: Pool | PoolClient, expenseId: string) {
  const { rows } = await client.query(
    `select e.id, e.category, e.amount, e.description, e.expense_date,
            e.vehicle_id, v.reg_no as vehicle_reg_no,
            e.created_by, e.created_at
     from public.expenses e
     left join public.vehicles v on v.id = e.vehicle_id
     where e.id = $1`,
    [expenseId],
  );
  return rows[0] ? normalizeNumericFields(rows[0], EXPENSE_FIELDS) : null;
}

async function assertVehicleExists(client: Pool | PoolClient, vehicleId: string) {
  const { rows } = await client.query(`select id from public.vehicles where id = $1`, [vehicleId]);
  if (!rows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Vehicle not found.');
  }
}

export async function createExpense(input: CreateExpenseInput, actingUser: ActingUser) {
  const { category, amount, description, expenseDate, vehicleId } = input;

  if (!category || amount === undefined || amount === null) {
    throw new ApiError(400, 'INVALID_INPUT', 'category and amount are required.');
  }
  assertCategory(category);
  if (!(amount > 0)) {
    throw new ApiError(400, 'INVALID_INPUT', 'amount must be greater than 0.');
  }

  try {
    return await withUserContext(actingUser.id, async (client) => {
      if (vehicleId) {
        await assertVehicleExists(client, vehicleId);
      }
      const { rows } = await client.query(
        `insert into public.expenses (category, amount, description, expense_date, vehicle_id, created_by)
         values ($1, $2, $3, coalesce($4, current_date), $5, $6)
         returning id`,
        [category, amount, description ?? null, expenseDate ?? null, vehicleId ?? null, actingUser.id],
      );
      return fetchExpense(client, rows[0].id);
    });
  } catch (err) {
    if (isDayLockError(err)) {
      throw new ApiError(423, 'DAY_LOCKED', (err as Error).message);
    }
    throw err;
  }
}

export async function listExpenses(query: ListExpensesQuery) {
  const { dateFrom, dateTo, category, vehicleId } = query;
  if (category) assertCategory(category);

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`e.expense_date >= $${params.length}`);
  }
  if (dateTo) {
    params.push(dateTo);
    conditions.push(`e.expense_date <= $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`e.category = $${params.length}`);
  }
  if (vehicleId) {
    params.push(vehicleId);
    conditions.push(`e.vehicle_id = $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  const baseFrom = `
    from public.expenses e
    left join public.vehicles v on v.id = e.vehicle_id
  `;

  const { rows: countRows } = await pool.query(`select count(*)::int as total ${baseFrom} ${where}`, params);
  const total = countRows[0].total;

  params.push(limit, offset);
  const { rows } = await pool.query(
    `select e.id, e.category, e.amount, e.description, e.expense_date,
            e.vehicle_id, v.reg_no as vehicle_reg_no,
            e.created_by, e.created_at
     ${baseFrom}
     ${where}
     order by e.expense_date desc, e.created_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params,
  );

  return { expenses: normalizeNumericRows(rows, EXPENSE_FIELDS), total, page, limit };
}

export async function updateExpense(id: string, input: UpdateExpenseInput, actingUser: ActingUser) {
  if (input.category !== undefined) assertCategory(input.category);
  if (input.amount !== undefined && !(input.amount > 0)) {
    throw new ApiError(400, 'INVALID_INPUT', 'amount must be greater than 0.');
  }

  const fieldMap: Record<string, unknown> = {
    category: input.category,
    amount: input.amount,
    description: input.description,
    expense_date: input.expenseDate,
    vehicle_id: input.vehicleId,
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

  try {
    return await withUserContext(actingUser.id, async (client) => {
      if (input.vehicleId) {
        await assertVehicleExists(client, input.vehicleId);
      }
      params.push(id);
      const { rows } = await client.query(
        `update public.expenses set ${setClauses.join(', ')} where id = $${params.length} returning id`,
        params,
      );
      if (!rows[0]) {
        throw new ApiError(404, 'NOT_FOUND', 'Expense not found.');
      }
      return fetchExpense(client, id);
    });
  } catch (err) {
    if (isDayLockError(err)) {
      throw new ApiError(423, 'DAY_LOCKED', (err as Error).message);
    }
    throw err;
  }
}

export async function deleteExpense(id: string, actingUser: ActingUser) {
  try {
    return await withUserContext(actingUser.id, async (client) => {
      const { rows } = await client.query(`delete from public.expenses where id = $1 returning id`, [id]);
      if (!rows[0]) {
        throw new ApiError(404, 'NOT_FOUND', 'Expense not found.');
      }
    });
  } catch (err) {
    if (isDayLockError(err)) {
      throw new ApiError(423, 'DAY_LOCKED', (err as Error).message);
    }
    throw err;
  }
}
