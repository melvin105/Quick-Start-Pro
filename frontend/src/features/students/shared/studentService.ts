import api from '../../../lib/api'
import { toApiError } from '../../../lib/apiError'

// Students service — follows the dashboardService reference shape (docs/road.md
// #119): interfaces mirror the backend rows, thin async functions over the
// shared `api` client, and a `catch` that rethrows via `toApiError` so callers
// only ever handle ApiError. Shapes mirror the backend studentService
// (GET/PATCH /students, backed by public.students + v_student_balances).

export type ApiStudentStatus = 'active' | 'completed' | 'suspended' | 'withdrawn' | 'archived'
export type ApiEnrolmentType = 'driving_only' | 'licence_only' | 'driving_and_licence'

// One row of GET /students (studentService.listStudents select). Balances are
// coerced to numbers by the backend; snake_case mirrors the SQL columns.
export interface ApiStudentListRow {
  id:                string
  student_number:    string
  first_name:        string
  last_name:         string
  gender:            string
  phone:             string
  email:             string | null
  status:            ApiStudentStatus
  enrolment_type:    ApiEnrolmentType
  registration_date: string | null
  photo_url:         string | null
  total_fees:        number
  total_paid:        number
  balance:           number
  package_name:      string | null
}

export interface ListStudentsParams {
  search?:        string
  status?:        ApiStudentStatus
  enrolmentType?: ApiEnrolmentType
  page?:          number
  limit?:         number
}

export interface StudentListResult {
  students: ApiStudentListRow[]
  total:    number
  page:     number
  limit:    number
}

// Mutation input — camelCase, matching the backend UpdateStudentInput. Every
// field is optional; the backend rejects an empty patch.
export interface UpdateStudentInput {
  firstName?:        string
  lastName?:         string
  gender?:           string
  dob?:              string
  phone?:            string
  email?:            string
  address?:          string
  emergencyContact?: string
  ghanaCardNo?:      string
  photoUrl?:         string
  status?:           ApiStudentStatus
  enrolmentType?:    ApiEnrolmentType
}

// GET /students — the paginated, filterable roster. `search` matches name,
// phone, or student number; `status`/`enrolmentType` narrow server-side.
export async function listStudents(params: ListStudentsParams = {}): Promise<StudentListResult> {
  try {
    const { data } = await api.get<StudentListResult>('/students', { params })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// PATCH /students/:id — partial update (e.g. status change / archive). Returns
// the refreshed student row so the caller can update the UI from server state.
export async function updateStudent(id: string, patch: UpdateStudentInput): Promise<ApiStudentListRow> {
  try {
    const { data } = await api.patch<ApiStudentListRow>(`/students/${id}`, patch)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
