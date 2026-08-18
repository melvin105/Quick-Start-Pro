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
  idCardType?:       string
  photoUrl?:         string
  status?:           ApiStudentStatus
  enrolmentType?:    ApiEnrolmentType
}

// Create input — camelCase, matching the backend CreateStudentInput. The
// students table has no next-of-kin columns, so the manual-register wizard
// sends only the emergency contact (collapsed to one free-text line by
// registerMapper) and drops the separate next-of-kin block. `enrolmentType` is
// derived from the chosen package; `confirmDifferentPerson` resubmits past the
// backend's 409 POSSIBLE_DUPLICATE guard.
export interface CreateStudentInput {
  firstName:               string
  lastName:                string
  gender:                  string
  dob:                     string
  phone:                   string
  email?:                  string
  address?:                string
  emergencyContact?:       string
  ghanaCardNo?:            string
  idCardType?:             string
  photoUrl?:               string
  enrolmentType:           ApiEnrolmentType
  packageId?:              string
  confirmDifferentPerson?: boolean
}

// The backend returns the full v_student_profile row on create; the wizard only
// needs these two (a confirmation message; navigation goes to the live list).
export interface CreatedStudent {
  id:             string
  student_number: string
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

// GET /students/:id — a single student's profile row (v_student_profile). This
// covers the fields the edit form pre-fills; the same view also carries
// balance/lesson/licence aggregates that the edit flow ignores. The raw
export type ApiExamResult = 'pending' | 'passed' | 'failed'

// The licence_tracking columns as they surface on the profile view and the
// pipeline list. Every field is nullable: the views left-join licence_tracking,
// so a student who hasn't started the pipeline yet comes through with all-null
// licence data. venue and licence-number are NOT stored by the backend, so they
// never appear here.
export interface ApiLicenceFields {
  eye_test_done:          boolean | null
  eye_test_date:          string | null
  learner_licence_issued: boolean | null
  learner_licence_date:   string | null
  exam_date:              string | null
  exam_result:            ApiExamResult | null
  licence_issued:         boolean | null
  licence_issued_date:    string | null
}

// first/last name, dob, gender and ghana_card_no are appended by migration
// 20260817000018 so the form can round-trip them. The licence fields come from
// the left-joined licence_tracking row (see v_student_profile).
export interface ApiStudentProfile extends ApiLicenceFields {
  id:                string
  student_number:    string
  student_name:      string
  first_name:        string
  last_name:         string
  dob:               string | null
  gender:            string
  status:            ApiStudentStatus
  enrolment_type:    ApiEnrolmentType
  phone:             string
  email:             string | null
  address:           string | null
  emergency_contact: string | null
  ghana_card_no:     string | null
  id_card_type?:     string | null
  photo_url:         string | null
  registration_date: string | null
  total_fees:        number
  total_paid:        number
  balance:           number
  total_lessons:     number
  lessons_used:      number
  lessons_left:      number
  package_name:      string | null
}

// One row of GET /students/licences (v_licence_pipeline) — the licence-enrolled
// students with their pipeline progress.
export interface ApiLicencePipelineRow extends ApiLicenceFields {
  id:             string
  student_number: string
  student_name:   string
  enrolment_type: ApiEnrolmentType
}

// PATCH /students/:id/licence body. Every field is optional; the backend skips
// undefined ones (partial upsert). remarks and examResult have no UI yet but are
// part of the contract. venue and licence-number aren't accepted — not stored.
export interface UpdateLicenceInput {
  eyeTestDone?:          boolean
  eyeTestDate?:          string
  learnerLicenceIssued?: boolean
  learnerLicenceDate?:   string
  examDate?:             string
  examResult?:           ApiExamResult
  licenceIssued?:        boolean
  licenceIssuedDate?:    string
  remarks?:              string
}

export async function getStudent(id: string): Promise<ApiStudentProfile> {
  try {
    const { data } = await api.get<ApiStudentProfile>(`/students/${id}`)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// POST /students — registers a new student. Throws an ApiError with code
// POSSIBLE_DUPLICATE (409) when a matching name/phone already exists; the caller
// resubmits with confirmDifferentPerson: true to proceed.
export async function createStudent(input: CreateStudentInput): Promise<CreatedStudent> {
  try {
    const { data } = await api.post<CreatedStudent>('/students', input)
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

// GET /students/licences — the licence pipeline for the Students → Licences
// screen (all licence-enrolled students, ordered by student number).
export async function listLicences(): Promise<ApiLicencePipelineRow[]> {
  try {
    const { data } = await api.get<ApiLicencePipelineRow[]>('/students/licences')
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// PATCH /students/:id/licence — upserts the licence-tracking row and returns it
// (the full licence_tracking record, carrying the same licence fields plus
// remarks). The caller re-derives progress from the returned row.
export async function updateLicence(id: string, patch: UpdateLicenceInput): Promise<ApiLicenceFields> {
  try {
    const { data } = await api.patch<ApiLicenceFields>(`/students/${id}/licence`, patch)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
