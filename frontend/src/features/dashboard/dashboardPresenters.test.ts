import { describe, it, expect } from 'vitest'
import {
  formatGHS,
  formatCount,
  formatLessonTime,
  initialsFrom,
  isToday,
  toTodaysSchedule,
} from './dashboardPresenters'
import type { UpcomingLesson } from './dashboardService'

describe('formatGHS', () => {
  it('formats with the GHS prefix and thousands separators', () => {
    expect(formatGHS(12450)).toBe('GHS 12,450')
  })

  it('rounds to whole cedis', () => {
    expect(formatGHS(499.6)).toBe('GHS 500')
  })

  it('handles zero', () => {
    expect(formatGHS(0)).toBe('GHS 0')
  })
})

describe('formatCount', () => {
  it('adds thousands separators', () => {
    expect(formatCount(1284)).toBe('1,284')
  })
})

describe('formatLessonTime', () => {
  it('strips a leading zero and drops seconds', () => {
    expect(formatLessonTime('09:00:00')).toBe('9:00')
  })

  it('leaves a two-digit hour intact', () => {
    expect(formatLessonTime('14:30')).toBe('14:30')
  })

  it('returns an empty string for null', () => {
    expect(formatLessonTime(null)).toBe('')
  })
})

describe('initialsFrom', () => {
  it('takes first and last initials for a full name', () => {
    expect(initialsFrom('John Mensah')).toBe('JM')
  })

  it('handles extra whitespace and middle names', () => {
    expect(initialsFrom('  Mary  Akua Owusu ')).toBe('MO')
  })

  it('falls back to the first two letters of a single name', () => {
    expect(initialsFrom('Kwesi')).toBe('KW')
  })

  it('returns ? for an empty name', () => {
    expect(initialsFrom('   ')).toBe('?')
  })
})

describe('isToday', () => {
  const now = new Date('2026-08-16T10:00:00')

  it('matches a same-day date-only string', () => {
    expect(isToday('2026-08-16', now)).toBe(true)
  })

  it('matches a same-day full timestamp', () => {
    expect(isToday('2026-08-16T14:00:00Z', now)).toBe(true)
  })

  it('rejects a different day', () => {
    expect(isToday('2026-08-17', now)).toBe(false)
  })
})

describe('toTodaysSchedule', () => {
  const now = new Date('2026-08-16T08:00:00')

  const lesson = (over: Partial<UpcomingLesson>): UpcomingLesson => ({
    id: 'l1',
    lesson_date: '2026-08-16',
    start_time: '09:00:00',
    end_time: '10:00:00',
    status: 'scheduled',
    student_number: 'DP-2026-0001',
    student_name: 'John Mensah',
    instructor_name: 'Kofi Asante',
    vehicle: 'GR-1234-24',
    ...over,
  })

  it('keeps only today and maps to ScheduleItem shape', () => {
    const items = toTodaysSchedule(
      [lesson({}), lesson({ id: 'l2', lesson_date: '2026-08-17', student_name: 'Ama Boateng' })],
      now,
    )
    expect(items).toEqual([
      {
        time: '9:00',
        initials: 'JM',
        name: 'John Mensah',
        detail: 'with Kofi Asante',
        status: 'confirmed',
      },
    ])
  })

  it('marks non-scheduled lessons as pending and handles a missing instructor', () => {
    const [item] = toTodaysSchedule([lesson({ status: 'rescheduled', instructor_name: null })], now)
    expect(item.status).toBe('pending')
    expect(item.detail).toBe('Lesson')
  })

  it('shows a dash when a lesson has no start time', () => {
    const [item] = toTodaysSchedule([lesson({ start_time: null })], now)
    expect(item.time).toBe('—')
  })
})
