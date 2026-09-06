import type { Day, SlotAssignment } from './types'

export const DAYS: Day[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
export const START_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16]

export const DAY_ABBR: Record<Day, string> = {
  MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat',
}

export const DAY_FULL: Record<Day, string> = {
  MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday',
}

export function slotKey(day: Day, hour: number) {
  return `${day}-${hour}`
}

function displayHour12(hour: number) {
  const h = hour % 12
  return h === 0 ? 12 : h
}

function periodFor(hour: number) {
  return hour < 12 || hour === 24 ? 'am' : 'pm'
}

// "8-9am", "12-1pm"
export function formatRangeShort(hour: number) {
  return `${displayHour12(hour)}-${displayHour12(hour + 1)}${periodFor(hour + 1)}`
}

// "10:00-11:00am"
export function formatRangeClock(hour: number) {
  return `${displayHour12(hour)}:00-${displayHour12(hour + 1)}:00${periodFor(hour + 1)}`
}

export function formatSlotLabel(day: Day, hour: number, short = false) {
  const dayLabel = short ? DAY_ABBR[day] : DAY_FULL[day]
  return `${dayLabel} · ${formatRangeClock(hour)}`
}

const BUSINESS_TIME_ZONE = 'Africa/Accra'
const DAY_FROM_NAME: Partial<Record<string, Day>> = {
  Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED', Thursday: 'THU', Friday: 'FRI', Saturday: 'SAT',
}

// Scheduling follows the school's local calendar in Accra, regardless of the
// device's time zone. Sunday has no grid column, so return null instead of
// highlighting an unrelated weekday.
export function getTodayLabel(date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date)
}

export function getTodayColumn(date = new Date()): Day | null {
  return DAY_FROM_NAME[getTodayLabel(date)] ?? null
}

export interface SlotRef {
  day:  Day
  hour: number
}

// A student can hold more than one slot in a week — return every one.
export function findStudentSlots(
  grid: Record<string, SlotAssignment[]>,
  studentId: string,
): SlotRef[] {
  const slots: SlotRef[] = []
  for (const [key, assignments] of Object.entries(grid)) {
    if (assignments.some((a) => a.studentId === studentId)) {
      const [day, hourStr] = key.split('-')
      slots.push({ day: day as Day, hour: Number(hourStr) })
    }
  }
  return slots
}

export function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}
