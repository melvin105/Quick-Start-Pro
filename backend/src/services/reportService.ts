import { pool } from '../db';
import { ApiError } from '../utils/ApiError';

const MONTH_RE = /^\d{4}-\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export interface DriverReportQuery {
  from: string;
  to: string;
  instructorId?: string;
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

// Weeks in the (inclusive) range, matching the frontend's avg-per-week maths
// so the migrated page shows the same numbers: whole days inclusive / 7.
function avgPerWeek(count: number, from: string, to: string): number {
  const days = Math.max(1, Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1);
  const weeks = days / 7;
  return weeks > 0 ? Math.round((count / weeks) * 10) / 10 : 0;
}

interface DriverStudentRow {
  studentId: string;
  studentName: string;
  lessonsInPeriod: number;
  totalAllTime: number;
}

// Driver report (#106): lessons delivered per instructor over a date range,
// served from real lesson_schedule rows to replace the frontend's fabricated
// lessonFacts.ts. Cancelled lessons are excluded — they were never taught — so
// counts reflect actual/planned instruction (scheduled, completed, no_show).
// `lessonsInPeriod` respects [from, to]; `totalAllTime` is the instructor's
// lifetime count. Instructors with no lessons still appear (with zeros) so the
// summary table lists the full roster. Optionally scoped to one instructor.
export async function getDriverReport(query: DriverReportQuery) {
  const { from, to, instructorId } = query;
  if (!from || !to) {
    throw new ApiError(400, 'INVALID_INPUT', 'from and to date range parameters are required.');
  }
  assertDate(from, 'from');
  assertDate(to, 'to');
  if (from > to) {
    throw new ApiError(400, 'INVALID_INPUT', 'from must not be after to.');
  }
  if (instructorId && !UUID_RE.test(instructorId)) {
    throw new ApiError(400, 'INVALID_INPUT', 'instructorId must be a valid UUID.');
  }

  const params: unknown[] = [from, to];
  const instructorFilter = instructorId ? ` and sf.id = $3` : '';
  if (instructorId) params.push(instructorId);

  // Per-instructor period + all-time counts. LEFT JOIN (with the cancelled
  // filter in the join condition) keeps instructors who have no lessons.
  const { rows: summaryRows } = await pool.query(
    `select
       sf.id as instructor_id,
       sf.first_name || ' ' || sf.last_name as instructor_name,
       count(ls.id) filter (where ls.lesson_date between $1 and $2)::int as lessons_in_period,
       count(ls.id)::int as total_all_time
     from public.staff sf
     left join public.lesson_schedule ls
       on ls.instructor_id = sf.id and ls.status <> 'cancelled'
     where sf.role = 'instructor'${instructorFilter}
     group by sf.id, sf.first_name, sf.last_name
     order by lessons_in_period desc, instructor_name`,
    params,
  );

  // Per-student breakdown per instructor (only students who have had lessons).
  const { rows: studentRows } = await pool.query(
    `select
       ls.instructor_id,
       st.id as student_id,
       st.first_name || ' ' || st.last_name as student_name,
       count(*) filter (where ls.lesson_date between $1 and $2)::int as lessons_in_period,
       count(*)::int as total_all_time
     from public.lesson_schedule ls
     join public.students st on st.id = ls.student_id
     where ls.status <> 'cancelled'${instructorId ? ` and ls.instructor_id = $3` : ''}
     group by ls.instructor_id, st.id, st.first_name, st.last_name
     order by lessons_in_period desc, total_all_time desc, student_name`,
    params,
  );

  const studentsByInstructor = new Map<string, DriverStudentRow[]>();
  for (const row of studentRows) {
    const list = studentsByInstructor.get(row.instructor_id) ?? [];
    list.push({
      studentId: row.student_id,
      studentName: row.student_name,
      lessonsInPeriod: row.lessons_in_period,
      totalAllTime: row.total_all_time,
    });
    studentsByInstructor.set(row.instructor_id, list);
  }

  const instructors = summaryRows.map((row) => ({
    instructorId: row.instructor_id,
    instructorName: row.instructor_name,
    lessonsInPeriod: row.lessons_in_period,
    totalAllTime: row.total_all_time,
    avgPerWeek: avgPerWeek(row.lessons_in_period, from, to),
    students: studentsByInstructor.get(row.instructor_id) ?? [],
  }));

  return {
    from,
    to,
    instructorId: instructorId ?? null,
    totalLessonsInPeriod: instructors.reduce((sum, i) => sum + i.lessonsInPeriod, 0),
    instructors,
  };
}

export async function getFinances(query: FinancesQuery) {
  const { from, to } = query;
  if (!from || !to) {
    throw new ApiError(400, 'INVALID_INPUT', 'from and to date range parameters are required.');
  }
  assertDate(from, 'from');
  assertDate(to, 'to');
  if (from > to) {
    throw new ApiError(400, 'INVALID_INPUT', 'from must not be after to.');
  }

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

  const [{ rows: incomeRows }, { rows: expenseRows }, { rows: closureRows }] = await Promise.all([
    pool.query(
      `select p.id, p.payment_date as date, p.created_at, p.amount,
              p.method, st.id as student_id,
              st.first_name || ' ' || st.last_name as student_name,
              pkg.package_name
       from public.payments p
       join public.students st on st.id = p.student_id
       left join lateral (
         select dp.package_name
         from public.student_packages sp
         join public.driving_packages dp on dp.id = sp.package_id
         where sp.student_id = st.id
         order by sp.assigned_date desc, sp.created_at desc
         limit 1
       ) pkg on true
       where p.payment_date between $1 and $2
       order by p.payment_date desc, p.created_at desc`,
      [from, to],
    ),
    pool.query(
      `select e.id, e.expense_date as date, e.created_at, e.amount,
              e.description, e.category
       from public.expenses e
       where e.expense_date between $1 and $2
       order by e.expense_date desc, e.created_at desc`,
      [from, to],
    ),
    pool.query(
      `select dc.closure_date, dc.opening_balance, dc.total_income,
              dc.total_expenses, dc.closing_balance, dc.status,
              dc.submitted_at, dc.approved_at, dc.remarks,
              nullif(trim(coalesce(ss.first_name, '') || ' ' || coalesce(ss.last_name, '')), '') as submitted_by_name,
              nullif(trim(coalesce(rs.first_name, '') || ' ' || coalesce(rs.last_name, '')), '') as reviewed_by_name
       from public.daily_closures dc
       left join public.users submitter on submitter.id = dc.submitted_by
       left join public.staff ss on ss.id = submitter.staff_id
       left join public.users reviewer on reviewer.id = dc.approved_by
       left join public.staff rs on rs.id = reviewer.staff_id
       where dc.closure_date between $1 and $2
       order by dc.closure_date desc`,
      [from, to],
    ),
  ]);

  return {
    from,
    to,
    income,
    expenses,
    net: income - expenses,
    outstandingBalance: Number(outstandingRows[0].outstanding),
    days,
    incomeEntries: incomeRows.map((row) => ({ ...row, amount: Number(row.amount) })),
    expenseEntries: expenseRows.map((row) => ({ ...row, amount: Number(row.amount) })),
    closures: closureRows.map((row) => ({
      ...row,
      opening_balance: Number(row.opening_balance),
      total_income: Number(row.total_income),
      total_expenses: Number(row.total_expenses),
      closing_balance: Number(row.closing_balance),
    })),
  };
}
