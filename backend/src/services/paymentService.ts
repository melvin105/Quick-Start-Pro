import { Pool, PoolClient } from 'pg';
import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';

const PAYMENT_METHODS = ['cash', 'momo', 'bank_transfer', 'cheque'] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface RecordPaymentInput {
  studentId: string;
  amount: number;
  method: string;
  paymentDate?: string;
  notes?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  method?: string;
  paymentDate?: string;
  notes?: string;
}

export interface ListPaymentsQuery {
  studentId?: string;
  method?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ActingUser {
  id: string;
  role: 'manager' | 'secretary';
}

function assertMethod(value: string): asserts value is PaymentMethod {
  if (!(PAYMENT_METHODS as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `method must be one of: ${PAYMENT_METHODS.join(', ')}`);
  }
}

// trg_lock_payments (block_closed_day_changes) raises a plain exception once a
// day is closed via the end-of-day workflow — translate that into a clean 423.
function isDayLockError(err: unknown): err is Error {
  return err instanceof Error && /is closed and approved/.test(err.message);
}

async function fetchPaymentWithReceipt(client: Pool | PoolClient, paymentId: string) {
  const { rows } = await client.query(
    `select p.id, p.student_id, p.amount, p.method, p.payment_date, p.notes, p.created_at,
            r.receipt_no, r.issued_at
     from public.payments p
     left join public.receipts r on r.payment_id = p.id
     where p.id = $1`,
    [paymentId],
  );
  return rows[0] ?? null;
}

export async function recordPayment(input: RecordPaymentInput, actingUser: ActingUser) {
  const { studentId, amount, method, paymentDate, notes } = input;

  if (!studentId || amount === undefined || amount === null || !method) {
    throw new ApiError(400, 'INVALID_INPUT', 'studentId, amount and method are required.');
  }
  if (!(amount > 0)) {
    throw new ApiError(400, 'INVALID_INPUT', 'amount must be greater than 0.');
  }
  assertMethod(method);

  const { rows: balanceRows } = await pool.query(
    `select balance from public.v_student_balances where id = $1`,
    [studentId],
  );
  if (!balanceRows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
  }
  const balance = Number(balanceRows[0].balance);
  if (amount > balance) {
    throw new ApiError(
      400,
      'EXCEEDS_BALANCE',
      `Amount cannot exceed the outstanding balance of GHS ${balance.toFixed(2)}.`,
    );
  }

  try {
    return await withUserContext(actingUser.id, async (client) => {
      const { rows } = await client.query(
        `insert into public.payments (student_id, amount, method, payment_date, recorded_by, notes)
         values ($1, $2, $3, coalesce($4, current_date), $5, $6)
         returning id`,
        [studentId, amount, method, paymentDate ?? null, actingUser.id, notes ?? null],
      );
      return fetchPaymentWithReceipt(client, rows[0].id);
    });
  } catch (err) {
    if (isDayLockError(err)) {
      throw new ApiError(423, 'DAY_LOCKED', (err as Error).message);
    }
    throw err;
  }
}

export async function listPayments(query: ListPaymentsQuery) {
  const { studentId, method, status, dateFrom, dateTo, search } = query;
  if (method) assertMethod(method);
  if (status && status !== 'paid' && status !== 'partial') {
    throw new ApiError(400, 'INVALID_INPUT', 'status must be one of: paid, partial');
  }

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (studentId) {
    params.push(studentId);
    conditions.push(`p.student_id = $${params.length}`);
  }
  if (method) {
    params.push(method);
    conditions.push(`p.method = $${params.length}`);
  }
  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`p.payment_date >= $${params.length}`);
  }
  if (dateTo) {
    params.push(dateTo);
    conditions.push(`p.payment_date <= $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    const p = params.length;
    conditions.push(`(st.first_name || ' ' || st.last_name ilike $${p} or r.receipt_no ilike $${p})`);
  }
  if (status) {
    conditions.push(status === 'paid' ? `coalesce(vb.balance, 0) <= 0` : `coalesce(vb.balance, 0) > 0`);
  }

  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  const baseFrom = `
    from public.payments p
    join public.students st on st.id = p.student_id
    left join public.receipts r on r.payment_id = p.id
    left join public.v_student_balances vb on vb.id = p.student_id
  `;

  const { rows: countRows } = await pool.query(`select count(*)::int as total ${baseFrom} ${where}`, params);
  const total = countRows[0].total;

  params.push(limit, offset);
  const { rows } = await pool.query(
    `select
       p.id, p.amount, p.method, p.payment_date, p.notes, p.created_at,
       st.id as student_id, st.student_number, st.first_name || ' ' || st.last_name as student_name,
       r.receipt_no,
       case when coalesce(vb.balance, 0) <= 0 then 'paid' else 'partial' end as status
     ${baseFrom}
     ${where}
     order by p.payment_date desc, p.created_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params,
  );

  return { payments: rows, total, page, limit };
}

export async function getStudentPaymentHistory(studentId: string) {
  const { rows: studentRows } = await pool.query(`select id from public.students where id = $1`, [studentId]);
  if (!studentRows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Student not found.');
  }

  const { rows: balanceRows } = await pool.query(
    `select total_fees, total_paid, balance from public.v_student_balances where id = $1`,
    [studentId],
  );
  const summary = balanceRows[0] ?? { total_fees: 0, total_paid: 0, balance: 0 };

  const { rows } = await pool.query(
    `select
       p.id, p.amount, p.method, p.payment_date, p.notes, p.created_at, r.receipt_no,
       coalesce($2::numeric, 0) - sum(p.amount) over (
         order by p.payment_date, p.created_at
         rows between unbounded preceding and current row
       ) as balance_after
     from public.payments p
     left join public.receipts r on r.payment_id = p.id
     where p.student_id = $1
     order by p.payment_date desc, p.created_at desc`,
    [studentId, summary.total_fees],
  );

  return { studentId, summary, payments: rows };
}

export async function updatePayment(id: string, input: UpdatePaymentInput, actingUser: ActingUser) {
  if (input.method) assertMethod(input.method);
  if (input.amount !== undefined && !(input.amount > 0)) {
    throw new ApiError(400, 'INVALID_INPUT', 'amount must be greater than 0.');
  }

  const fieldMap: Record<string, unknown> = {
    amount: input.amount,
    method: input.method,
    payment_date: input.paymentDate,
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

  try {
    return await withUserContext(actingUser.id, async (client) => {
      params.push(id);
      const { rows } = await client.query(
        `update public.payments set ${setClauses.join(', ')} where id = $${params.length} returning id`,
        params,
      );
      if (!rows[0]) {
        throw new ApiError(404, 'NOT_FOUND', 'Payment not found.');
      }
      return fetchPaymentWithReceipt(client, id);
    });
  } catch (err) {
    if (isDayLockError(err)) {
      throw new ApiError(423, 'DAY_LOCKED', (err as Error).message);
    }
    throw err;
  }
}

export async function getReceiptById(id: string) {
  const { rows } = await pool.query(
    `select
       r.id, r.receipt_no, r.issued_at,
       p.id as payment_id, p.amount, p.method, p.payment_date, p.notes,
       st.id as student_id, st.student_number, st.first_name || ' ' || st.last_name as student_name,
       pkg.package_name,
       coalesce(vb.total_fees, 0) as package_fee,
       coalesce(vb.total_paid, 0) as total_paid,
       coalesce(vb.balance, 0)    as balance,
       sf.first_name || ' ' || sf.last_name as recorded_by_name
     from public.receipts r
     join public.payments p on p.id = r.payment_id
     join public.students st on st.id = p.student_id
     left join public.v_student_balances vb on vb.id = st.id
     left join lateral (
       select dp.package_name
       from public.student_packages sp
       join public.driving_packages dp on dp.id = sp.package_id
       where sp.student_id = st.id
       order by sp.assigned_date desc, sp.created_at desc
       limit 1
     ) pkg on true
     left join public.users u on u.id = p.recorded_by
     left join public.staff sf on sf.id = u.staff_id
     where r.id = $1`,
    [id],
  );
  if (!rows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Receipt not found.');
  }
  return rows[0];
}
