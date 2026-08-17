import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'
import type { ApiEnrolmentType } from '../students/shared/studentService'

// Registration service — the pending self-registration queue that feeds the
// manager dashboard's "Pending Approvals" card. Follows the dashboardService
// reference shape (see docs/road.md #119): interfaces mirror the backend rows,
// thin async functions over the shared `api` client, and a `catch` that
// rethrows via `toApiError` so callers only ever handle ApiError.

export type RegistrationStatus = 'pending' | 'approved' | 'rejected'

// One row of GET /registrations (backend registrationService.REGISTRATION_SELECT).
// Only the fields the frontend reads are typed; the rest are carried on approval.
export interface Registration {
  id:            string
  first_name:    string
  last_name:     string
  phone:         string
  email:         string | null
  status:        RegistrationStatus
  student_id:    string | null
  submitted_at:  string
  created_at:    string
}

// Public self-registration payload — everything the student knows about
// themselves. Enrolment/package is added by staff at approval (see
// ApproveRegistrationInput), so it isn't collected here. Mirrors the backend
// SubmitRegistrationInput (camelCase in, snake_case stored).
export interface SubmitRegistrationInput {
  firstName:    string
  lastName:     string
  dob:          string
  gender:       'male' | 'female'
  phone:        string
  email?:       string
  address?:     string
  photo?:       string
  idCardType?:  string
  idCardNumber?: string
  nextOfKin: {
    name:         string
    relationship: string
    phone:        string
    email?:       string
  }
  emergencyContact: {
    name:         string
    phone:        string
    relationship: string
  }
}

// POST /registrations returns just the receipt of the pending row.
export interface SubmittedRegistration {
  id:           string
  status:       RegistrationStatus
  submitted_at: string
}

export interface RegistrationInvitation {
  token:     string
  expiresAt: string
}

export async function createRegistrationInvitation(phone?: string): Promise<RegistrationInvitation> {
  try {
    const { data } = await api.post<RegistrationInvitation>('/registrations/invite', { phone })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// Public, unauthenticated — a prospective student submits their own details and
// they land in the pending queue for staff to approve. The shared `api` client
// only attaches an auth token when one exists, so it's safe to call logged out.
export async function submitRegistration(
  input: SubmitRegistrationInput,
  sessionToken: string,
): Promise<SubmittedRegistration> {
  try {
    const { data } = await api.post<SubmittedRegistration>('/registrations', { ...input, sessionToken })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// GET /registrations?status=pending — the queue of self-registrations awaiting
// staff review. The backend returns the rows oldest-first (submitted_at asc).
export async function getPendingRegistrations(): Promise<Registration[]> {
  try {
    const { data } = await api.get<Registration[]>('/registrations', { params: { status: 'pending' } })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// Staff-supplied enrolment decision at approval (the desk "Step 4"). Package
// assignment is deferred until the settings/packages domain is on live data —
// passing a mock package id here would break the real foreign key — so only
// the enrolment type is sent for now. `confirmDifferentPerson` retries past the
// backend's POSSIBLE_DUPLICATE (409) guard when staff confirm it's a new person.
export interface ApproveRegistrationInput {
  enrolmentType:           ApiEnrolmentType
  confirmDifferentPerson?: boolean
}

// POST /registrations/:id/approve returns the newly created student row
// (backend insertStudentRow RETURNING id, student_number).
export interface ApprovedStudent {
  id:             string
  student_number: string
}

export async function approveRegistration(
  id: string,
  input: ApproveRegistrationInput,
): Promise<ApprovedStudent> {
  try {
    const { data } = await api.post<ApprovedStudent>(`/registrations/${id}/approve`, input)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// POST /registrations/:id/reject records who rejected it and why, and returns
// the updated (now 'rejected') registration row.
export async function rejectRegistration(id: string, reason: string): Promise<Registration> {
  try {
    const { data } = await api.post<Registration>(`/registrations/${id}/reject`, { reason })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
