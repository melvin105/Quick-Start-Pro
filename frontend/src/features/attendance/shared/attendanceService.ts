import api from '../../../lib/api'
import { toApiError } from '../../../lib/apiError'

// Attendance service — same shape as the other domain services (thin async
// functions over the shared `api` client, rethrowing via `toApiError`). Rows
// come back snake_case (unlike the camelCase scheduling domain). Backed by
// GET/POST /api/v1/attendance (attendanceService.listAttendance / markAttendance).

export type ApiAttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type ApiCheckinMethod = 'self_qr' | 'manual'

// One row of GET /attendance. The backend builds the daily roster by
// left-joining every active student to their slot for that weekday and to any
// attendance row for the date, so every field past the student is nullable:
// a scheduled-but-unmarked student has a slot time but null status, while a
// walk-in has attendance fields but null slot times.
export interface ApiAttendanceRow {
  student_id:     string
  student_number: string
  student_name:   string
  start_time:     string | null
  end_time:       string | null
  attendance_id:  string | null
  check_in_time:  string | null
  method:         ApiCheckinMethod | null
  status:         ApiAttendanceStatus | null
  is_walk_in:     boolean | null
  notes:          string | null
  driver_id:      string | null
  driver_name:    string | null
  lessons_left:   number | null
}

export interface ListAttendanceResult {
  date:       string
  attendance: ApiAttendanceRow[]
}

export interface ListAttendanceParams {
  date?:   string
  status?: ApiAttendanceStatus
}

// POST /attendance body — camelCase, matching the backend MarkAttendanceInput.
// Only studentId + status are required; the backend defaults method to 'manual',
// isWalkIn to `!slotId`, and nulls check_in_time for absent/excused.
export interface MarkAttendanceInput {
  studentId:       string
  status:          ApiAttendanceStatus
  method?:         ApiCheckinMethod
  isWalkIn?:       boolean
  slotId?:         string
  driverId?:       string
  checkInTime?:    string
  attendanceDate?: string
  notes?:          string
}

// The full joined row POST /attendance returns (the SELECT_ATTENDANCE columns).
// Callers refetch the roster after marking, so this is typed for completeness
// rather than consumed directly.
export interface ApiMarkedAttendanceRow {
  id:              string
  student_id:      string
  attendance_date: string
  slot_id:         string | null
  check_in_time:   string | null
  method:          ApiCheckinMethod
  status:          ApiAttendanceStatus
  is_walk_in:      boolean
  notes:           string | null
  driver_id:       string | null
  marked_by:       string | null
  created_at:      string
  student_number:  string
  student_name:    string
  start_time:      string | null
  end_time:        string | null
  driver_name:     string | null
}

// GET /attendance — the daily roster for `date` (defaults to today server-side),
// optionally narrowed to one status. Both roles may read.
export async function listAttendance(params: ListAttendanceParams = {}): Promise<ListAttendanceResult> {
  try {
    const { data } = await api.get<ListAttendanceResult>('/attendance', { params })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// POST /attendance — marks (upserts) a student's attendance for the day; the
// backend upserts on (student_id, attendance_date). Returns the refreshed row.
// A mutation, so it stays a plain awaited call (not useApiResource): the caller
// awaits, then refetches the roster.
export async function markAttendance(input: MarkAttendanceInput): Promise<ApiMarkedAttendanceRow> {
  try {
    const { data } = await api.post<ApiMarkedAttendanceRow>('/attendance', input)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
