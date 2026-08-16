import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'

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
