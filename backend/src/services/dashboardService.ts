import { pool } from '../db';

type Role = 'manager' | 'secretary';

// Finance figures that only the manager dashboard surfaces. The secretary
// dashboard shows operational counts and outstanding balances, but not the
// monthly revenue/expense totals — so these keys are stripped for secretaries.
const MANAGER_ONLY_STATS = ['revenue_this_month', 'expenses_this_month'] as const;

const MONTHLY_REVENUE_MONTHS = 12;
const RECENT_ACTIVITY_LIMIT = 4;

interface DashboardPayload {
  role: Role;
  stats: Record<string, number>;
  todaysAttendance: unknown[];
  monthlyRevenue?: unknown[];
  weeklySchedule?: unknown[];
  recentActivity?: unknown[];
}

// Today's actions by the acting secretary, for the dashboard's Recent Activity
// feed — scoped to today like the rest of the dashboard (Today's Schedule,
// Payments Recorded), so it goes empty rather than surfacing stale days-old
// entries on a quiet day. Pulled straight from the columns/tables that already
// attribute writes to a user — payments.recorded_by, attendance.marked_by —
// plus audit_logs for student registrations, since `students` itself has no
// such column. Three small queries merged in JS beat one UNION ALL across
// differently-shaped rows (amount vs. status vs. nothing) — same result, no
// ad-hoc casting.
async function getRecentActivity(userId: string) {
  const [payments, attendance, students] = await Promise.all([
    pool.query(
      `select 'payment' as kind, p.created_at, p.amount, st.first_name || ' ' || st.last_name as student_name
       from public.payments p join public.students st on st.id = p.student_id
       where p.recorded_by = $1
         and p.created_at >= current_date
         and p.created_at < current_date + interval '1 day'
       order by p.created_at desc limit $2`,
      [userId, RECENT_ACTIVITY_LIMIT],
    ),
    pool.query(
      `select 'attendance' as kind, a.created_at, a.status, a.check_in_time,
              st.first_name || ' ' || st.last_name as student_name
       from public.attendance a join public.students st on st.id = a.student_id
       where a.marked_by = $1
         and a.created_at >= current_date
         and a.created_at < current_date + interval '1 day'
       order by a.created_at desc limit $2`,
      [userId, RECENT_ACTIVITY_LIMIT],
    ),
    pool.query(
      `select 'student' as kind, al.created_at,
              (al.new_data ->> 'first_name') || ' ' || (al.new_data ->> 'last_name') as student_name
       from public.audit_logs al
       where al.user_id = $1 and al.table_name = 'students' and al.action = 'INSERT'
         and al.created_at >= current_date
         and al.created_at < current_date + interval '1 day'
       order by al.created_at desc limit $2`,
      [userId, RECENT_ACTIVITY_LIMIT],
    ),
  ]);

  // pg returns `numeric` columns as strings (to avoid silent precision loss);
  // coerce just the one numeric field so the frontend gets a real number.
  const rows = [...payments.rows, ...attendance.rows, ...students.rows];
  for (const row of rows) {
    if (row.kind === 'payment') row.amount = Number(row.amount);
  }

  return rows
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, RECENT_ACTIVITY_LIMIT);
}

// Single round-trip for dashboard card figures, today's attendance, and the
// role-specific manager or secretary data.
export async function getDashboard(role: Role, userId: string): Promise<DashboardPayload> {
  // Every block below is independent. Starting them together is especially
  // important when the API and Supabase are in different regions: serial
  // round trips multiply network latency even when each SQL query is small.
  const roleDataPromise = role === 'manager'
    ? pool.query(
        `select month, payment_count, total_revenue
         from public.v_monthly_revenue
         order by month desc
         limit $1`,
        [MONTHLY_REVENUE_MONTHS],
      ).then(({ rows }) => rows)
    : getRecentActivity(userId);

  // Count the recurring assignments displayed by the Scheduling screen. The
  // former lesson_schedule source omitted recurring slots and produced zeros.
  const weeklySchedulePromise = role === 'manager'
    ? pool.query(
        `select sl.day_of_week, count(sa.id)::int as count
         from public.schedule_slots sl
         left join public.slot_assignments sa
           on sa.slot_id = sl.id and sa.is_active
         where sl.is_active
         group by sl.day_of_week
         order by sl.day_of_week`,
      ).then(({ rows }) => rows)
    : Promise.resolve([]);

  const [
    { rows: statRows },
    { rows: supplementalRows },
    { rows: todaysAttendance },
    roleData,
    weeklySchedule,
  ] = await Promise.all([
    pool.query(`select * from public.v_dashboard_stats`),
    pool.query(
      `select
         (select count(*)::int from public.payments
          where created_at >= current_date
            and created_at < current_date + interval '1 day') as payments_recorded_today,
         (select coalesce(sum(amount), 0) from public.payments
          where created_at >= current_date
            and created_at < current_date + interval '1 day') as payments_recorded_today_total,
         (select count(*)::int from public.v_student_balances where balance > 0) as students_with_balance,
         (select count(*)::int from public.licence_tracking where not licence_issued) as licences_in_progress`,
    ),
    pool.query(
      `select * from public.v_today_attendance order by start_time nulls last, student_name`,
    ),
    roleDataPromise,
    weeklySchedulePromise,
  ]);

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

  const supplemental = supplementalRows[0] ?? {};
  stats.payments_recorded_today = Number(supplemental.payments_recorded_today ?? 0);
  stats.payments_recorded_today_total = Number(supplemental.payments_recorded_today_total ?? 0);
  stats.students_with_balance = Number(supplemental.students_with_balance ?? 0);
  stats.licences_in_progress = Number(supplemental.licences_in_progress ?? 0);

  const payload: DashboardPayload = { role, stats, todaysAttendance };

  if (role === 'manager') {
    payload.monthlyRevenue = roleData;
    payload.weeklySchedule = weeklySchedule;
  } else {
    payload.recentActivity = roleData;
  }

  return payload;
}
