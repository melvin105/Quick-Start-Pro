import type { UpcomingLesson } from './dashboardService'
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
