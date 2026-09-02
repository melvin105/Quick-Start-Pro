import { format, formatDistanceToNowStrict } from 'date-fns'
import type { MonthlyRevenue, RawActivityEntry, TodayAttendance, UpcomingLesson } from './dashboardService'
import type { ActivityItem } from './manager/ActivityFeed'
import type { ScheduleItem } from './secretary/TodaysSchedule'

// Pure view-mapping helpers for the dashboard: they turn the backend payload
// (dashboardService types) into the props the presentational components already
// expect. Kept separate from the components so they can be unit-tested without
// rendering (see the integration/test acceptance criterion on #123).

// GHS money formatting for the stat cards, e.g. 12450 -> "GHS 12,450".
export function formatGHS(amount: number): string {
  return `GHS ${Math.round(amount).toLocaleString('en-GH')}`
}

// Plain count with thousands separators, e.g. 1284 -> "1,284".
export function formatCount(n: number): string {
  return n.toLocaleString('en-GH')
}

// "09:00:00" / "09:00" -> "9:00". Returns '' for null so the caller can decide
// how to render a lesson with no start time.
export function formatLessonTime(time: string | null): string {
  if (!time) return ''
  const [hh, mm] = time.split(':')
  const hour = Number(hh)
  if (Number.isNaN(hour)) return time
  return `${hour}:${mm ?? '00'}`
}

// "John Mensah" -> "JM"; single names -> first two letters; empty -> "?".
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const TODAYS_SCHEDULE_LIMIT = 3

// Map today's attendance roster into the ScheduleItem[] the TodaysSchedule
// card renders — same source as the Attendance page (v_today_attendance via
// dashboardService.todaysAttendance), so the two always agree, unlike the old
// version of this function which read v_upcoming_lessons: a separate,
// one-off-dated-lesson table that a recurring weekly slot never appears in.
// Already sorted by start_time server-side; just take the first few.
export function toTodaysSchedule(attendance: TodayAttendance[]): ScheduleItem[] {
  return attendance.slice(0, TODAYS_SCHEDULE_LIMIT).map((row) => ({
    time:     formatLessonTime(row.start_time) || '—',
    initials: initialsFrom(row.student_name),
    name:     row.student_name,
    status:   row.check_in_time ? 'completed' : 'upcoming',
  }))
}

// One line of activity text per entry kind, naming the student and (for a
// payment) the amount so consecutive entries of the same kind read as
// distinct events rather than repeats of the same generic line. "Recorded",
// not "received" — the secretary is entering a payment into the system, not
// the one physically receiving the money.
function activityText(entry: RawActivityEntry): string {
  switch (entry.kind) {
    case 'payment':
      return `${formatGHS(entry.amount)} payment recorded for ${entry.student_name}`
    case 'student':
      return `${entry.student_name} registered`
    case 'attendance':
      return entry.check_in_time
        ? `${entry.student_name} completed today's lesson`
        : `${entry.student_name} marked absent`
  }
}

// Map the secretary's recent payments/attendance marks/registrations into the
// ActivityItem[] the (shared, manager-authored) ActivityFeed card renders.
export function toActivityFeed(entries: RawActivityEntry[]): ActivityItem[] {
  return entries.map((entry) => ({
    icon: entry.kind,
    text: activityText(entry),
    time: formatDistanceToNowStrict(new Date(entry.created_at), { addSuffix: true }),
  }))
}

// ---------------------------------------------------------------------------
// Manager dashboard presenters
// ---------------------------------------------------------------------------

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// v_monthly_revenue.month is 'YYYY-MM' (to_char); turn it into a short label
// ('2026-08' -> 'Aug'). Falls back to the raw value if it can't be parsed.
export function formatMonthLabel(month: string): string {
  const mm = Number(month.slice(5, 7))
  return MONTH_ABBR[mm - 1] ?? month
}

export interface RevenuePoint {
  month:   string
  revenue: number
}

// The backend returns the monthly series newest-first (order by month desc); the
// chart reads left-to-right oldest-first, so sort ascending and label the axis.
export function toRevenueSeries(rows: MonthlyRevenue[]): RevenuePoint[] {
  return [...rows]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((row) => ({ month: formatMonthLabel(row.month), revenue: row.total_revenue }))
}

export function netProfit(revenue: number, expenses: number): number {
  return revenue - expenses
}

// Whole-percent change of the latest month's revenue over the previous month.
// Returns null when there is no comparable previous month (or it was zero), so
// the caller can simply omit the delta rather than render a misleading figure.
export function monthlyRevenueDelta(rows: MonthlyRevenue[]): number | null {
  const series = [...rows].sort((a, b) => a.month.localeCompare(b.month))
  if (series.length < 2) return null
  const previous = series[series.length - 2].total_revenue
  const current = series[series.length - 1].total_revenue
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

// "+12% vs last month" / "-3% vs last month".
export function deltaLabel(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct}% vs last month`
}

const WEEK_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export interface DayCount {
  day:   string
  count: number
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Monday-based index (Mon = 0 … Sun = 6) for a 'YYYY-MM-DD' string.
function weekdayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return (new Date(y, m - 1, d).getDay() + 6) % 7
}

// Lesson counts per weekday for the Monday–Sunday week containing `now`.
// NOTE: v_upcoming_lessons is today-forward and capped (limit 10), so days
// earlier in the week — and busy weeks beyond the cap — can under-count. This
// is a known limitation until a dedicated weekly-counts endpoint exists.
export function toWeekCounts(lessons: UpcomingLesson[], now: Date = new Date()): DayCount[] {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7))
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)
  const startKey = localDateKey(monday)
  const endKey = localDateKey(sunday)

  const counts = [0, 0, 0, 0, 0, 0, 0]
  for (const lesson of lessons) {
    const key = lesson.lesson_date.slice(0, 10)
    if (key >= startKey && key <= endKey) counts[weekdayIndex(key)]++
  }
  return WEEK_DAYS.map((day, i) => ({ day, count: counts[i] }))
}

// A pending registration's submission time as "Wed, 16 Jul" for the approvals
// list. Returns '' for an empty/invalid timestamp so the row can omit it.
export function formatSubmittedDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return format(date, 'EEE, d MMM')
}
