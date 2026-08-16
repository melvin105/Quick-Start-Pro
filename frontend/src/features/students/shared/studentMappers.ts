import type { ApiEnrolmentType, ApiStudentListRow } from './studentService'
import type { StudentStatus } from './types'

// Pure mappers between the backend student row (snake_case enums) and the view
// models the list components render. Kept separate from the service and the
// components so they can be unit-tested without HTTP or rendering.

// Enum ↔ display label for enrolment type. The label strings match the filter
// dropdown options in the Students pages.
const ENROLMENT_LABEL: Record<ApiEnrolmentType, string> = {
  driving_and_licence: 'Driving + Licence',
  licence_only:        'Licence Only',
  driving_only:        'Driving Only',
}

const ENROLMENT_ENUM: Record<string, ApiEnrolmentType> = {
  'Driving + Licence': 'driving_and_licence',
  'Licence Only':      'licence_only',
  'Driving Only':      'driving_only',
}

export function enrolmentLabel(type: ApiEnrolmentType): string {
  return ENROLMENT_LABEL[type] ?? type
}

// Maps a filter-dropdown label back to the backend enum for the query param.
// Returns undefined for '' (no filter) or an unrecognized label.
export function enrolmentEnum(label: string): ApiEnrolmentType | undefined {
  return ENROLMENT_ENUM[label]
}

// The list badge collapses the backend status + balance into the three states
// StatusBadge renders: an unpaid balance shows as 'outstanding' regardless of
// enrolment status; a finished programme as 'completed'; everything else
// (active/suspended/withdrawn/archived) as 'active'.
export function displayStatus(row: Pick<ApiStudentListRow, 'status' | 'balance'>): StudentStatus {
  if (row.balance > 0) return 'outstanding'
  if (row.status === 'completed') return 'completed'
  return 'active'
}

// The view model the students list table/cards consume. Keeps the UUID `id`
// (for routing) separate from the human `studentNumber` (displayed).
export interface StudentListItem {
  id:            string
  studentNumber: string
  name:          string
  phone:         string
  enrolment:     string
  balance:       number
  status:        StudentStatus
  photo?:        string
}

export function toStudentListItem(row: ApiStudentListRow): StudentListItem {
  return {
    id:            row.id,
    studentNumber: row.student_number,
    name:          `${row.first_name} ${row.last_name}`.trim(),
    phone:         row.phone,
    enrolment:     enrolmentLabel(row.enrolment_type),
    balance:       row.balance,
    status:        displayStatus(row),
    photo:         row.photo_url ?? undefined,
  }
}
