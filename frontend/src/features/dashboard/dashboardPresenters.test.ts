import { describe, it, expect } from 'vitest'
import {
  formatGHS,
  formatCount,
  formatLessonTime,
  initialsFrom,
  toTodaysSchedule,
  toActivityFeed,
  formatMonthLabel,
  toRevenueSeries,
  netProfit,
  monthlyRevenueDelta,
  deltaLabel,
  toWeekCounts,
  formatSubmittedDate,
} from './dashboardPresenters'
import type { MonthlyRevenue, RawActivityEntry, TodayAttendance } from './dashboardService'

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

describe('toTodaysSchedule', () => {
  const row = (over: Partial<TodayAttendance>): TodayAttendance => ({
    student_id: 's1',
    student_name: 'John Mensah',
    start_time: '09:00:00',
    end_time: '10:00:00',
    check_in_time: null,
    method: null,
    status: null,
    is_walk_in: false,
    ...over,
  })

  it('maps attendance rows to ScheduleItem shape', () => {
    const items = toTodaysSchedule([row({})])
    expect(items).toEqual([
      { time: '9:00', initials: 'JM', name: 'John Mensah', status: 'upcoming' },
    ])
  })

  it('marks a row as completed once checked in', () => {
    const [item] = toTodaysSchedule([row({ check_in_time: '2026-08-16T09:02:00Z' })])
    expect(item.status).toBe('completed')
  })

  it('shows a dash when a row has no start time (e.g. a walk-in)', () => {
    const [item] = toTodaysSchedule([row({ start_time: null })])
    expect(item.time).toBe('—')
  })

  it('takes only the first three, trusting the caller already sorted them', () => {
    const rows = [row({ student_id: '1' }), row({ student_id: '2' }), row({ student_id: '3' }), row({ student_id: '4' })]
    expect(toTodaysSchedule(rows)).toHaveLength(3)
  })
})

describe('toActivityFeed', () => {
  const now = new Date('2026-08-16T10:00:00')

  it('names the student and amount in a payment entry', () => {
    const entry: RawActivityEntry = { kind: 'payment', created_at: now.toISOString(), amount: 500, student_name: 'John Mensah' }
    expect(toActivityFeed([entry])[0]).toMatchObject({ icon: 'payment', text: 'GHS 500 payment recorded for John Mensah' })
  })

  it('names the student in a registration entry', () => {
    const entry: RawActivityEntry = { kind: 'student', created_at: now.toISOString(), student_name: 'Ama Boateng' }
    expect(toActivityFeed([entry])[0]).toMatchObject({ icon: 'student', text: 'Ama Boateng registered' })
  })

  it('names the student and distinguishes a completed lesson from an absence', () => {
    const completed: RawActivityEntry = { kind: 'attendance', created_at: now.toISOString(), status: 'present', check_in_time: now.toISOString(), student_name: 'Kwesi Owusu' }
    const absent: RawActivityEntry = { kind: 'attendance', created_at: now.toISOString(), status: 'absent', check_in_time: null, student_name: 'Kwesi Owusu' }
    expect(toActivityFeed([completed])[0].text).toBe("Kwesi Owusu completed today's lesson")
    expect(toActivityFeed([absent])[0].text).toBe('Kwesi Owusu marked absent')
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
  it('maps recurring assignment counts to weekdays (Mon…Sun)', () => {
    const counts = toWeekCounts([
      { day_of_week: 1, count: 2 },
      { day_of_week: 5, count: 1 },
      { day_of_week: 6, count: 3 },
    ])
    expect(counts).toEqual([
      { day: 'MON', count: 2 },
      { day: 'TUE', count: 0 },
      { day: 'WED', count: 0 },
      { day: 'THU', count: 0 },
      { day: 'FRI', count: 1 },
      { day: 'SAT', count: 3 },
      { day: 'SUN', count: 0 },
    ])
  })

  it('coerces database counts and ignores invalid weekdays', () => {
    const counts = toWeekCounts([
      { day_of_week: 2, count: '4' as unknown as number },
      { day_of_week: 8, count: 9 },
    ])
    expect(counts[1]).toEqual({ day: 'TUE', count: 4 })
    expect(counts[6]).toEqual({ day: 'SUN', count: 0 })
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
