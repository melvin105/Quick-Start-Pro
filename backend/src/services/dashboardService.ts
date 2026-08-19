import { pool } from '../db';

type Role = 'manager' | 'secretary';

// Finance figures that only the manager dashboard surfaces. The secretary
// dashboard shows operational counts and outstanding balances, but not the
// monthly revenue/expense totals — so these keys are stripped for secretaries.
const MANAGER_ONLY_STATS = ['revenue_this_month', 'expenses_this_month'] as const;

const UPCOMING_LESSONS_LIMIT = 10;
const MONTHLY_REVENUE_MONTHS = 12;

interface DashboardPayload {
  role: Role;
  stats: Record<string, number>;
  upcomingLessons: unknown[];
  todaysAttendance: unknown[];
  monthlyRevenue?: unknown[];
}

// Single round-trip for the dashboard: the v_dashboard_stats card figures plus
// today's schedule (v_upcoming_lessons), today's attendance (v_today_attendance)
// and — for managers — the monthly revenue series (v_monthly_revenue).
export async function getDashboard(role: Role): Promise<DashboardPayload> {
  const { rows: statRows } = await pool.query(`select * from public.v_dashboard_stats`);

  // v_dashboard_stats returns a single row of counts/sums; pg hands bigint and
  // numeric back as strings, so coerce to numbers for the cards to read directly.
  const stats: Record<string, number> = {};
  for (const [key, value] of Object.entries(statRows[0] ?? {})) {
    stats[key] = value === null ? 0 : Number(value);
  }
  if (role === 'secretary') {
    for (const field of MANAGER_ONLY_STATS) {
      delete stats[field];
    }
  }

  const { rows: upcomingLessons } = await pool.query(
    `select * from public.v_upcoming_lessons limit $1`,
    [UPCOMING_LESSONS_LIMIT],
  );

  const { rows: todaysAttendance } = await pool.query(
    `select * from public.v_today_attendance order by start_time nulls last, student_name`,
  );

  const payload: DashboardPayload = { role, stats, upcomingLessons, todaysAttendance };

  if (role === 'manager') {
    const { rows: monthlyRevenue } = await pool.query(
      `select month, payment_count, total_revenue
       from public.v_monthly_revenue
       order by month desc
       limit $1`,
      [MONTHLY_REVENUE_MONTHS],
    );
    payload.monthlyRevenue = monthlyRevenue;
  }

  return payload;
}
