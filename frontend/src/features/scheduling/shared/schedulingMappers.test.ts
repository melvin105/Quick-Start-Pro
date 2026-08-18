import { describe, it, expect } from 'vitest'
import { toScheduleGrid, toCellAssignment, isCellFull } from './schedulingMappers'
import type { ApiScheduleSlot, ApiSlotAssignment } from './schedulingService'

const assignment: ApiSlotAssignment = {
  studentId: 'uuid-a', studentNumber: 'DP-2026-0001', studentName: 'John Mensah',
  lessonsRemaining: 6, assignedDate: '2026-08-10',
}

function slot(overrides: Partial<ApiScheduleSlot> = {}): ApiScheduleSlot {
  return {
    id: 'slot-1', dayOfWeek: 1, day: 'MON', startHour: 8,
    startTime: '08:00:00', endTime: '09:00:00', capacity: 2, isActive: true,
    assignments: [],
    ...overrides,
  }
}

describe('toCellAssignment', () => {
  it('maps the API assignment to the cell shape, renaming studentName to name', () => {
    expect(toCellAssignment(assignment)).toEqual({
      studentId: 'uuid-a', studentNumber: 'DP-2026-0001', name: 'John Mensah', lessonsRemaining: 6,
    })
  })
})

describe('toScheduleGrid', () => {
  it('keys each slot by DAY-hour and carries slot id, capacity and assignments', () => {
    const grid = toScheduleGrid({ slots: [slot({ assignments: [assignment] })] })
    expect(grid['MON-8']).toEqual({
      slotId: 'slot-1', capacity: 2, isActive: true,
      assignments: [{ studentId: 'uuid-a', studentNumber: 'DP-2026-0001', name: 'John Mensah', lessonsRemaining: 6 }],
    })
  })

  it('drops slots with no Mon–Sat day (day_of_week outside 1–6)', () => {
    const grid = toScheduleGrid({ slots: [slot({ id: 'sunday', day: null, dayOfWeek: 0 })] })
    expect(Object.keys(grid)).toHaveLength(0)
  })

  it('places multiple slots on distinct day-hour keys', () => {
    const grid = toScheduleGrid({
      slots: [slot(), slot({ id: 'slot-2', day: 'WED', dayOfWeek: 3, startHour: 13 })],
    })
    expect(Object.keys(grid).sort()).toEqual(['MON-8', 'WED-13'])
  })
})

describe('isCellFull', () => {
  it('is true once assignments reach capacity', () => {
    const grid = toScheduleGrid({ slots: [slot({ capacity: 1, assignments: [assignment] })] })
    expect(isCellFull(grid['MON-8'])).toBe(true)
  })

  it('is false below capacity and for an undefined cell', () => {
    const grid = toScheduleGrid({ slots: [slot({ capacity: 2, assignments: [assignment] })] })
    expect(isCellFull(grid['MON-8'])).toBe(false)
    expect(isCellFull(undefined)).toBe(false)
  })
})
