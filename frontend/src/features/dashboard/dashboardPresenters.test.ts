import { describe, it, expect } from 'vitest'
import {
  formatGHS,
  formatCount,
  formatLessonTime,
  initialsFrom,
  isToday,
  toTodaysSchedule,
  formatMonthLabel,
  toRevenueSeries,
  netProfit,
  monthlyRevenueDelta,
  deltaLabel,
  toWeekCounts,
  formatSubmittedDate,
} from './dashboardPresenters'
import type { MonthlyRevenue, UpcomingLesson } from './dashboardService'

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

describe('formatMonthLabel', () => {
  it('turns a YYYY-MM string into a short month name', () => {
    expect(formatMonthLabel('2026-08')).toBe('Aug')
    expect(formatMonthLabel('2026-01')).toBe('Jan')
    expect(formatMonthLabel('2026-12')).toBe('Dec')
  })

  it('falls back to the raw value when it cannot be parsed', () => {
    expect(formatMonthLabel('nope')).toBe('nope')
  })
})

describe('toRevenueSeries', () => {
  const rows: MonthlyRevenue[] = [
    { month: '2026-08', payment_count: 5, total_revenue: 18200 },
    { month: '2026-06', payment_count: 3, total_revenue: 17300 },
    { month: '2026-07', payment_count: 4, total_revenue: 17900 },
  ]

  it('sorts ascending and maps to labelled revenue points', () => {
    expect(toRevenueSeries(rows)).toEqual([
      { month: 'Jun', revenue: 17300 },
      { month: 'Jul', revenue: 17900 },
      { month: 'Aug', revenue: 18200 },
    ])
  })

  it('does not mutate the input array', () => {
    const copy = [...rows]
    toRevenueSeries(rows)
    expect(rows).toEqual(copy)
  })

  it('handles an empty series', () => {
    expect(toRevenueSeries([])).toEqual([])
  })
})

describe('netProfit', () => {
  it('subtracts expenses from revenue', () => {
    expect(netProfit(18200, 9560)).toBe(8640)
  })

  it('can go negative', () => {
    expect(netProfit(5000, 8000)).toBe(-3000)
  })
})

describe('monthlyRevenueDelta', () => {
  const rows: MonthlyRevenue[] = [
    { month: '2026-08', payment_count: 5, total_revenue: 18200 },
    { month: '2026-07', payment_count: 4, total_revenue: 17000 },
  ]

  it('returns the whole-percent change of the latest month over the previous', () => {
    // (18200 - 17000) / 17000 = 7.06% -> 7
    expect(monthlyRevenueDelta(rows)).toBe(7)
  })

  it('returns null with fewer than two months', () => {
    expect(monthlyRevenueDelta([rows[0]])).toBeNull()
    expect(monthlyRevenueDelta([])).toBeNull()
  })

  it('returns null when the previous month was zero (no baseline)', () => {
    expect(
      monthlyRevenueDelta([
        { month: '2026-08', payment_count: 5, total_revenue: 18200 },
        { month: '2026-07', payment_count: 0, total_revenue: 0 },
      ]),
    ).toBeNull()
  })
})

describe('deltaLabel', () => {
  it('prefixes a plus sign for gains', () => {
    expect(deltaLabel(7)).toBe('+7% vs last month')
  })

  it('keeps the minus sign for losses', () => {
    expect(deltaLabel(-3)).toBe('-3% vs last month')
  })
})

describe('toWeekCounts', () => {
  // Sunday 2026-08-16, so the Monday-based week is 2026-08-10 … 2026-08-16.
  const now = new Date('2026-08-16T10:00:00')

  const lesson = (lesson_date: string): UpcomingLesson => ({
    id: `l-${lesson_date}`,
    lesson_date,
    start_time: '09:00:00',
    end_time: '10:00:00',
    status: 'scheduled',
    student_number: 'DP-2026-0001',
    student_name: 'John Mensah',
    instructor_name: 'Kofi Asante',
    vehicle: 'GR-1234-24',
  })

  it('buckets lessons of the current week by weekday (Mon…Sun)', () => {
    const counts = toWeekCounts(
      [lesson('2026-08-10'), lesson('2026-08-10'), lesson('2026-08-14'), lesson('2026-08-16')],
      now,
    )
    expect(counts).toEqual([
      { day: 'MON', count: 2 },
      { day: 'TUE', count: 0 },
      { day: 'WED', count: 0 },
      { day: 'THU', count: 0 },
      { day: 'FRI', count: 1 },
      { day: 'SAT', count: 0 },
      { day: 'SUN', count: 1 },
    ])
  })

  it('ignores lessons outside the current week', () => {
    const counts = toWeekCounts([lesson('2026-08-09'), lesson('2026-08-17')], now)
    expect(counts.every((d) => d.count === 0)).toBe(true)
  })
})

describe('formatSubmittedDate', () => {
  it('formats an ISO timestamp as "Wed, 16 Aug"', () => {
    expect(formatSubmittedDate('2026-08-16T09:30:00')).toBe('Sun, 16 Aug')
  })

  it('returns an empty string for null or an invalid date', () => {
    expect(formatSubmittedDate(null)).toBe('')
    expect(formatSubmittedDate('not-a-date')).toBe('')
  })
})
