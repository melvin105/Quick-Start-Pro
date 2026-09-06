import api from '../../../lib/api'
import { toApiError } from '../../../lib/apiError'

export interface CheckinStudent {
  id:            string
  studentNumber: string
  name:          string
  photoUrl:      string | null
}

export interface CheckinSlot {
  id:        string
  startTime: string
  endTime:   string
}

export type CheckinLookupResult =
  | { status: 'not_found' }
  | {
      status: 'ok' | 'already_checked_in'
      student: CheckinStudent
      scheduledToday: boolean
      slot: CheckinSlot | null
      checkInTime?: string | null
    }

export interface PublicInstructor {
  id:   string
  name: string
}

export interface CheckinResult {
  studentName:       string
  studentNumber:     string
  checkInTime:       string | null
  instructorName:    string | null
  alreadyCheckedIn:  boolean
}

export async function lookupCheckin(phone: string): Promise<CheckinLookupResult> {
  try {
    const { data } = await api.post<CheckinLookupResult>('/checkin/lookup', { phone })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function listPublicInstructors(): Promise<PublicInstructor[]> {
  try {
    const { data } = await api.get<{ instructors: PublicInstructor[] }>('/checkin/instructors')
    return data.instructors
  } catch (err) {
    throw toApiError(err)
  }
}

export async function submitSelfCheckin(
  phone: string,
  instructorId?: string,
): Promise<CheckinResult> {
  try {
    const { data } = await api.post<CheckinResult>('/checkin', {
      phone,
      ...(instructorId ? { instructorId } : {}),
    })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
