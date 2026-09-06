import { pool } from '../db';
import { ApiError } from '../utils/ApiError';
import { normalizeNumericFields, normalizeNumericRows } from '../utils/normalizeNumeric';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const LEDGER_NUMERIC_FIELDS = ['income', 'expense'] as const;
const CLOSURE_NUMERIC_FIELDS = ['opening_balance', 'total_income', 'total_expenses', 'closing_balance'] as const;

export async function getDailyRecords(date: string) {
  if (!DATE_RE.test(date)) {
    throw new ApiError(400, 'INVALID_INPUT', 'date must be in YYYY-MM-DD format.');
  }

  const [ledgerResult, closureResult] = await Promise.all([
    pool.query(
      `select entry_id, entry_type, entry_date, entry_time, description, category,
              source_category, income, expense
       from public.v_daily_ledger
       where entry_date = $1
       order by entry_time`,
      [date],
    ),
    pool.query(
      `select dc.*,
              nullif(trim(coalesce(ss.first_name, '') || ' ' || coalesce(ss.last_name, '')), '') as submitted_by_name,
              nullif(trim(coalesce(rs.first_name, '') || ' ' || coalesce(rs.last_name, '')), '') as reviewed_by_name
       from public.daily_closures dc
       left join public.users su on su.id = dc.submitted_by
       left join public.staff ss on ss.id = su.staff_id
       left join public.users ru on ru.id = dc.approved_by
       left join public.staff rs on rs.id = ru.staff_id
       where dc.closure_date = $1`,
      [date],
    ),
  ]);
  const ledgerRows = ledgerResult.rows;
  const ledger = normalizeNumericRows(ledgerRows, LEDGER_NUMERIC_FIELDS);
  const closureRows = closureResult.rows;

  let closure = closureRows[0];
  if (!closure) {
    const { rows: priorRows } = await pool.query(
      `select coalesce(closing_balance, 0) as opening_balance
       from public.daily_closures
       where closure_date < $1 and status = 'closed'
       order by closure_date desc
       limit 1`,
      [date],
    );
    const opening = Number(priorRows[0]?.opening_balance ?? 0);
    const totalIncome = ledger.reduce((sum, row) => sum + Number(row.income ?? 0), 0);
    const totalExpenses = ledger.reduce((sum, row) => sum + Number(row.expense ?? 0), 0);
    closure = {
      closure_date: date,
      opening_balance: opening,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      closing_balance: opening + totalIncome - totalExpenses,
      status: 'open',
      submitted_by: null,
      submitted_at: null,
      approved_by: null,
      approved_at: null,
      remarks: null,
      submitted_by_name: null,
      reviewed_by_name: null,
    };
  }

  return { date, ledger, closure: normalizeNumericFields(closure, CLOSURE_NUMERIC_FIELDS) };
}
