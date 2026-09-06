import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'
import type { Role } from '../../lib/constants'

// Dashboard service — the reference pattern for the Phase 2 domain migration
// (see docs/road.md #119 → #123). Every domain service follows this shape:
//   1. interfaces that mirror the backend response exactly,
//   2. thin async functions over the shared `api` client, and
//   3. a `catch` that rethrows via `toApiError` so callers only handle ApiError.
//
// Shapes below mirror GET /dashboard (backend dashboardService.getDashboard
// and the underlying dashboard, attendance, and revenue views).

// One row of v_dashboard_stats, coerced to numbers by the backend. The two
// finance figures are manager-only — the backend strips them for secretaries,
// so they are optional here.
export interface DashboardStats {
  total_students:                number
  active_students:               number
  outstanding_balances:          number
  lessons_completed:             number
  licences_issued:               number
  upcoming_lessons:              number
  payments_recorded_today:       number
  payments_recorded_today_total: number
  students_with_balance:         number
  licences_in_progress:          number
  revenue_this_month?:           number
  expenses_this_month?:          number
}

export interface TodayAttendance {
  student_id:    string
  student_name:  string
  start_time:    string | null
  end_time:      string | null
  check_in_time: string | null
  method:        string | null
  status:        string | null
  is_walk_in:    boolean
}

export interface MonthlyRevenue {
  month:         string
  payment_count: number
  total_revenue: number
}

export interface WeeklyScheduleCount {
  day_of_week: number
  count:       number
}

// One row of the secretary's Recent Activity feed — a payment they recorded,
// an attendance mark they made, or a student they registered. Discriminated
// by `kind`; fields outside a variant's relevance are simply absent.
export type RawActivityEntry =
  | { kind: 'payment';    created_at: string; amount: number; student_name: string }
  | { kind: 'attendance'; created_at: string; status: string; check_in_time: string | null; student_name: string }
  | { kind: 'student';    created_at: string; student_name: string }

export interface Dashboard {
  role:             Role
  stats:            DashboardStats
  todaysAttendance: TodayAttendance[]
  // Present only for managers.
  monthlyRevenue?:  MonthlyRevenue[]
  weeklySchedule?:  WeeklyScheduleCount[]
  // Present only for secretaries.
  recentActivity?:  RawActivityEntry[]
}

// GET /dashboard — the whole dashboard in one round-trip. The backend tailors
// the payload to the caller's role from their bearer token, so no role argument
// is sent; the returned `role` echoes what the server used.
export async function getDashboard(): Promise<Dashboard> {
  try {
    const { data } = await api.get<Dashboard>('/dashboard')
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
