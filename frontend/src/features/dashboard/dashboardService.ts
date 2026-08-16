import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'
import type { Role } from '../../lib/constants'

// Dashboard service — the reference pattern for the Phase 2 domain migration
// (see docs/road.md #119 → #123). Every domain service follows this shape:
//   1. interfaces that mirror the backend response exactly,
//   2. thin async functions over the shared `api` client, and
//   3. a `catch` that rethrows via `toApiError` so callers only handle ApiError.
//
// Shapes below mirror GET /dashboard (backend dashboardService.getDashboard +
// the underlying views v_dashboard_stats, v_upcoming_lessons,
// v_today_attendance, v_monthly_revenue).

// One row of v_dashboard_stats, coerced to numbers by the backend. The two
// finance figures are manager-only — the backend strips them for secretaries,
// so they are optional here.
export interface DashboardStats {
  total_students:       number
  active_students:      number
  outstanding_balances: number
  lessons_completed:    number
  licences_issued:      number
  upcoming_lessons:     number
  revenue_this_month?:  number
  expenses_this_month?: number
}

export interface UpcomingLesson {
  id:              string
  lesson_date:     string
  start_time:      string | null
  end_time:        string | null
  status:          string
  student_number:  string
  student_name:    string
  instructor_name: string | null
  vehicle:         string | null
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

export interface Dashboard {
  role:             Role
  stats:            DashboardStats
  upcomingLessons:  UpcomingLesson[]
  todaysAttendance: TodayAttendance[]
  // Present only for managers.
  monthlyRevenue?:  MonthlyRevenue[]
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
