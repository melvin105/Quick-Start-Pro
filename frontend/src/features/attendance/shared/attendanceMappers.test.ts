import { describe, it, expect } from 'vitest'
import { toAttendanceRecord, toAttendanceRoster, toStudentAttendanceRecord } from './attendanceMappers'
import type { ApiAttendanceRow, ApiMarkedAttendanceRow, ListAttendanceResult } from './attendanceService'

function row(overrides: Partial<ApiAttendanceRow> = {}): ApiAttendanceRow {
  return {
    student_id:     'stu-1',
    student_number: 'DP-2026-0001',
    student_name:   'John Mensah',
    slot_id:        'slot-1',
    start_time:     '08:00:00',
    end_time:       '09:00:00',
    attendance_id:  'att-1',
    check_in_time:  '2026-08-17T08:23:00.000Z',
    method:         'manual',
    status:         'present',
    is_walk_in:     false,
    auto_marked:    false,
    notes:          null,
    driver_id:      'drv-1',
    driver_name:    'Obed Asante',
    lessons_left:   6,
    ...overrides,
  }
}

describe('toAttendanceRecord', () => {
  it('maps a marked, scheduled row to the view model', () => {
    expect(toAttendanceRecord(row(), '2026-08-17')).toEqual({
      id:          'att-1',
      studentId:   'stu-1',
      studentNumber: 'DP-2026-0001',
      studentName: 'John Mensah',
      date:        '2026-08-17',
      slotId:      'slot-1',
      slotLabel:   '8-9am',
      hasSlot:     true,
      checkInTime: '8:23am',
      source:      'manual',
      driverName:  'Obed Asante',
      lessonsLeft: 6,
      status:      'present',
      notes:       undefined,
    })
  })

  it('keys an unmarked scheduled student by student id and leaves status/source blank', () => {
    const record = toAttendanceRecord(
      row({ attendance_id: null, check_in_time: null, method: null, status: null, driver_id: null, driver_name: null }),
      '2026-08-17',
    )
    expect(record.id).toBe('stu-1')
    expect(record.hasSlot).toBe(true)
    expect(record.status).toBeUndefined()
    expect(record.source).toBeUndefined()
    expect(record.checkInTime).toBeUndefined()
    expect(record.driverName).toBeUndefined()
  })

  it('treats a row with no slot time as a walk-in (no slot label)', () => {
    const record = toAttendanceRecord(
      row({ start_time: null, end_time: null, is_walk_in: true }),
      '2026-08-17',
    )
    expect(record.hasSlot).toBe(false)
    expect(record.slotLabel).toBeUndefined()
  })

  it('maps the self_qr method to the self source and carries the four statuses', () => {
    expect(toAttendanceRecord(row({ method: 'self_qr' }), '2026-08-17').source).toBe('self')
    for (const status of ['present', 'absent', 'late', 'excused'] as const) {
      expect(toAttendanceRecord(row({ status }), '2026-08-17').status).toBe(status)
    }
  })

  it('identifies a system-created absence', () => {
    expect(toAttendanceRecord(row({ status: 'absent', auto_marked: true }), '2026-08-17').autoMarked).toBe(true)
  })

  it('defaults a null lessons_left to 0', () => {
    expect(toAttendanceRecord(row({ lessons_left: null }), '2026-08-17').lessonsLeft).toBe(0)
  })

  it('renders an afternoon slot start as a pm label', () => {
    expect(toAttendanceRecord(row({ start_time: '14:00:00' }), '2026-08-17').slotLabel).toBe('2-3pm')
  })
})

describe('toAttendanceRoster', () => {
  it('maps every row and stamps each with the result date', () => {
    const result: ListAttendanceResult = {
      date: '2026-08-17',
      attendance: [row(), row({ student_id: 'stu-2', student_name: 'Ama Owusu', attendance_id: 'att-2' })],
    }
    const records = toAttendanceRoster(result)
    expect(records).toHaveLength(2)
    expect(records.map((r) => r.date)).toEqual(['2026-08-17', '2026-08-17'])
    expect(records.map((r) => r.studentName)).toEqual(['John Mensah', 'Ama Owusu'])
  })
})

describe('toStudentAttendanceRecord', () => {
  it('maps a persisted history row using its own attendance date', () => {
    const historyRow: ApiMarkedAttendanceRow = {
      id: 'att-1', student_id: 'stu-1', attendance_date: '2026-08-10', slot_id: 'slot-1',
      check_in_time: '2026-08-10T08:23:00.000Z', method: 'manual', status: 'present',
      is_walk_in: false, auto_marked: false, notes: null, driver_id: 'drv-1', marked_by: 'user-1',
      created_at: '2026-08-10T08:23:00.000Z', student_number: 'DP-2026-0001',
      student_name: 'John Mensah', start_time: '08:00:00', end_time: '09:00:00',
      driver_name: 'Obed Asante',
    }

    expect(toStudentAttendanceRecord(historyRow)).toMatchObject({
      id: 'att-1', studentId: 'stu-1', studentNumber: 'DP-2026-0001', date: '2026-08-10', slotLabel: '8-9am',
      checkInTime: '8:23am', source: 'manual', status: 'present', driverName: 'Obed Asante',
    })
  })
})
