import { format } from 'date-fns'
import type { MonthlyRevenue, UpcomingLesson } from './dashboardService'
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

// The dashboard's "Today's Schedule" only shows today; v_upcoming_lessons spans
// today forward, so filter by date. Dates from the API are ISO ('YYYY-MM-DD' or
// a full timestamp), so a prefix compare against today's local date is enough.
export function isToday(lessonDate: string, now: Date = new Date()): boolean {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
  return lessonDate.slice(0, 10) === today
}

// A scheduled lesson reads as "confirmed"; anything else (rescheduled/tentative)
// as "pending". The ScheduleItem badge only has these two states.
function toScheduleStatus(status: string): ScheduleItem['status'] {
  return status === 'scheduled' ? 'confirmed' : 'pending'
}

// Map today's lessons into the ScheduleItem[] the TodaysSchedule card renders.
export function toTodaysSchedule(lessons: UpcomingLesson[], now: Date = new Date()): ScheduleItem[] {
  return lessons
    .filter((lesson) => isToday(lesson.lesson_date, now))
    .map((lesson) => ({
      time:     formatLessonTime(lesson.start_time) || '—',
      initials: initialsFrom(lesson.student_name),
      name:     lesson.student_name,
      detail:   lesson.instructor_name ? `with ${lesson.instructor_name}` : 'Lesson',
      status:   toScheduleStatus(lesson.status),
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
