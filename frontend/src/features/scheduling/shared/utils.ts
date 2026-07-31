import { INSTRUCTORS } from '../../attendance/shared/mockData'
import type { Day, SlotAssignment } from './types'

export const DAYS: Day[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
export const START_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16]

// A slot can only hold as many lessons as there are instructors to run them —
// one student per active driving instructor, per hour.
export const MAX_STUDENTS_PER_SLOT = INSTRUCTORS.filter((i) => i.active).length

export function isSlotFull(assignments: SlotAssignment[]) {
  return assignments.length >= MAX_STUDENTS_PER_SLOT
}

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

// Sunday has no column in this Mon-Sat board; fall back to the seeded demo day.
export function getTodayColumn(): Day {
  const jsDay = new Date().getDay()
  const map: Record<number, Day> = { 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT' }
  return map[jsDay] ?? 'WED'
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
