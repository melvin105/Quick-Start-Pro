import { pool } from '../db';
import { ApiError } from '../utils/ApiError';

const MONTH_RE = /^\d{4}-\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface RevenueReportQuery {
  from?: string;
  to?: string;
}

export interface DvlaReportQuery {
  status?: string;
}

export interface FinancesQuery {
  from: string;
  to: string;
}

function assertMonth(value: string, field: string): void {
  if (!MONTH_RE.test(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `${field} must be in YYYY-MM format.`);
  }
}

function assertDate(value: string, field: string): void {
  if (!DATE_RE.test(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `${field} must be in YYYY-MM-DD format.`);
  }
}

export async function getRevenueReport(query: RevenueReportQuery) {
  const { from, to } = query;
  if (from) assertMonth(from, 'from');
  if (to) assertMonth(to, 'to');

  const conditions: string[] = [];
  const params: unknown[] = [];
  if (from) {
    params.push(from);
    conditions.push(`month >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`month <= $${params.length}`);
  }
  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';

  const { rows } = await pool.query(
    `select month, payment_count, total_revenue from public.v_monthly_revenue ${where} order by month desc`,
    params,
  );
  return rows;
}

// DVLA submission column mapping (which fields, what order/labels DVLA expects
// on the actual form) has not been confirmed with the client — this returns
// the full v_licence_pipeline record set for now so the frontend has
// everything available; narrow/relabel columns once that's confirmed.
export async function getDvlaReport(query: DvlaReportQuery) {
  const { status } = query;
  if (status && !['issued', 'awaiting'].includes(status)) {
    throw new ApiError(400, 'INVALID_INPUT', 'status must be one of: issued, awaiting.');
  }

  let condition = '(coalesce(licence_issued, false) or coalesce(learner_licence_issued, false))';
  if (status === 'issued') {
    condition = 'coalesce(licence_issued, false)';
  } else if (status === 'awaiting') {
    condition = 'coalesce(learner_licence_issued, false) and not coalesce(licence_issued, false)';
  }

  const { rows } = await pool.query(
    `select * from public.v_licence_pipeline where ${condition} order by student_number`,
  );
  return rows;
}

export async function getFinances(query: FinancesQuery) {
  const { from, to } = query;
  if (!from || !to) {
    throw new ApiError(400, 'INVALID_INPUT', 'from and to date range parameters are required.');
  }
  assertDate(from, 'from');
  assertDate(to, 'to');

  const { rows } = await pool.query(
    `select entry_date, coalesce(sum(income), 0) as income, coalesce(sum(expense), 0) as expense
     from public.v_daily_ledger
     where entry_date between $1 and $2
     group by entry_date
     order by entry_date`,
    [from, to],
  );

  const days = rows.map((row) => ({
    date: row.entry_date,
    income: Number(row.income),
    expenses: Number(row.expense),
    net: Number(row.income) - Number(row.expense),
  }));

  const income = days.reduce((sum, day) => sum + day.income, 0);
  const expenses = days.reduce((sum, day) => sum + day.expenses, 0);

  const { rows: outstandingRows } = await pool.query(
    `select coalesce(sum(balance), 0) as outstanding from public.v_student_balances where balance > 0`,
  );

  return {
    from,
    to,
    income,
    expenses,
    net: income - expenses,
    outstandingBalance: Number(outstandingRows[0].outstanding),
    days,
  };
}
