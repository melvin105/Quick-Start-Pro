import api from '../../../lib/api'
import { toApiError } from '../../../lib/apiError'
import type { Day } from './types'

// Scheduling service — same shape as the other domain services (thin async
// functions over the shared `api` client, rethrowing via `toApiError`). Note the
// backend hands these rows back in camelCase, unlike the snake_case rows the
// other domains return, and it denormalises the student's name, number and
// remaining lessons into each assignment — so the grid renders without the
// students store. Backed by GET /scheduling/slots (public.schedule_slots +
// public.slot_assignments, joined in schedulingService.listSlots).

export interface ApiSlotAssignment {
  studentId:        string
  studentNumber:    string
  studentName:      string
  lessonsRemaining: number
  assignedDate:     string
}

export interface ApiScheduleSlot {
  id:          string
  dayOfWeek:   number
  day:         Day | null
  startHour:   number
  startTime:   string
  endTime:     string
  capacity:    number
  isActive:    boolean
  assignments: ApiSlotAssignment[]
}

export interface ApiUnscheduledStudent {
  id:               string
  studentNumber:    string
  studentName:      string
  packageName:      string | null
  lessonsRemaining: number
}

export interface ListSlotsResult {
  slots:                ApiScheduleSlot[]
  // Optional during a rolling frontend/backend deployment; older API versions
  // return only slots and the UI safely treats that as an empty list.
  unscheduledStudents?: ApiUnscheduledStudent[]
}

export interface ApplySlotToDaysResult {
  assignedDays:        number[]
  alreadyAssignedDays: number[]
  startHour:           number
}

export interface RemoveSlotFromDaysResult {
  removedDays: number[]
  startHour:   number
}

// GET /scheduling/slots — the full Mon–Sat weekly grid (pre-seeded slots), each
// with its active assignments. Both roles may read.
export async function listSlots(): Promise<ListSlotsResult> {
  try {
    const { data } = await api.get<ListSlotsResult>('/scheduling/slots')
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// POST /scheduling/slots/:slotId/assignments — assigns a student to a slot.
// Returns the single updated slot (same shape as a listSlots entry). The backend
// enforces capacity under an advisory lock and rejects with a 409 ApiError whose
// code is SLOT_FULL, ALREADY_ASSIGNED or SLOT_INACTIVE — callers surface the
// message. Mutations stay as plain awaited calls (not useApiResource): the caller
// awaits, then refetches the grid so denormalised lesson counts stay in sync.
export async function assignStudent(slotId: string, studentId: string): Promise<ApiScheduleSlot> {
  try {
    const { data } = await api.post<ApiScheduleSlot>(
      `/scheduling/slots/${slotId}/assignments`,
      { studentId },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// POST /scheduling/slots/:slotId/apply-days — copies an assigned slot's time
// to multiple weekdays in one capacity-safe transaction.
export async function applySlotToDays(
  slotId: string,
  studentId: string,
  days: number[],
): Promise<ApplySlotToDaysResult> {
  try {
    const { data } = await api.post<ApplySlotToDaysResult>(
      `/scheduling/slots/${slotId}/apply-days`,
      { studentId, days },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// POST /scheduling/slots/:slotId/remove-days — removes the same recurring time
// from selected weekdays in one transaction.
export async function removeSlotFromDays(
  slotId: string,
  studentId: string,
  days: number[],
): Promise<RemoveSlotFromDaysResult> {
  try {
    const { data } = await api.post<RemoveSlotFromDaysResult>(
      `/scheduling/slots/${slotId}/remove-days`,
      { studentId, days },
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// DELETE /scheduling/slots/:slotId/assignments/:studentId — removes (deactivates)
// a student's assignment on a slot. Returns the updated slot.
export async function unassignStudent(slotId: string, studentId: string): Promise<ApiScheduleSlot> {
  try {
    const { data } = await api.delete<ApiScheduleSlot>(
      `/scheduling/slots/${slotId}/assignments/${studentId}`,
    )
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
