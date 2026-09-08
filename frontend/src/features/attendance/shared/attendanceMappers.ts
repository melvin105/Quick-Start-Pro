import { formatRangeShort } from '../../scheduling/shared/utils'
import type { AttendanceRecord, CheckInSource } from './types'
import type { ApiAttendanceRow, ApiCheckinMethod, ApiMarkedAttendanceRow, ListAttendanceResult } from './attendanceService'

// Pure mappers turning the snake_case attendance roster rows into the
// AttendanceRecord view model the tables/cards already render. Kept side-effect
// free and unit-tested; the backend now computes the roster (who's expected,
// their lessons left, their scheduled driver), replacing the mock store's
// syncFromSchedule + client lesson counting.

// Slots are whole hours, so the start time alone gives the "8-9am" label the
// mock used (formatRangeShort computes start → start+1). Null when the student
// has no slot today (a walk-in).
function slotLabelFrom(startTime: string | null): string | undefined {
  if (!startTime) return undefined
  const hour = parseInt(startTime.slice(0, 2), 10)
  if (Number.isNaN(hour)) return undefined
  return formatRangeShort(hour)
}

// check_in_time is a full ISO timestamp; render it as the "8:23am" style label
// the UI uses. Formatted in UTC — the school runs in Accra (GMT year-round), so
// UTC is both correct for the client and deterministic for tests.
function formatCheckInTime(iso: string | null): string | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return undefined
  return d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
    .toLowerCase()
    .replace(' ', '')
}

function sourceFrom(method: ApiCheckinMethod | null): CheckInSource | undefined {
  if (method === 'self_qr') return 'self'
  if (method === 'manual') return 'manual'
  return undefined
}

export function toAttendanceRecord(row: ApiAttendanceRow, date: string): AttendanceRecord {
  return {
    // A student appears once per roster, so the student id is a stable key even
    // before they have an attendance row.
    id:          row.attendance_id ?? row.student_id,
    studentId:   row.student_id,
    studentNumber: row.student_number,
    studentName: row.student_name,
    date,
    slotId:      row.slot_id ?? undefined,
    slotLabel:   slotLabelFrom(row.start_time),
    hasSlot:     row.start_time !== null,
    checkInTime: formatCheckInTime(row.check_in_time),
    source:      sourceFrom(row.method),
    driverName:  row.driver_name ?? undefined,
    lessonsLeft: row.lessons_left ?? 0,
    status:      row.status ?? undefined,
    autoMarked:  row.auto_marked || undefined,
    notes:       row.notes ?? undefined,
  }
}

export function toAttendanceRoster(result: ListAttendanceResult): AttendanceRecord[] {
  return result.attendance.map((row) => toAttendanceRecord(row, result.date))
}

export function toStudentAttendanceRecord(row: ApiMarkedAttendanceRow): AttendanceRecord {
  return toAttendanceRecord({
    student_id: row.student_id,
    student_number: row.student_number,
    student_name: row.student_name,
    slot_id: row.slot_id,
    start_time: row.start_time,
    end_time: row.end_time,
    attendance_id: row.id,
    check_in_time: row.check_in_time,
    method: row.method,
    status: row.status,
    is_walk_in: row.is_walk_in,
    auto_marked: row.auto_marked,
    notes: row.notes,
    driver_id: row.driver_id,
    driver_name: row.driver_name,
    lessons_left: null,
  }, row.attendance_date)
}
