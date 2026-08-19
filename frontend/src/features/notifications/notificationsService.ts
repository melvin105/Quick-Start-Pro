import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'

// Notifications service — same shape as the other domain services (thin async
// functions over the shared `api` client, rethrowing via `toApiError`). Rows
// come back snake_case. Backed by GET/PATCH /api/v1/notifications
// (backend notificationService).

export type ApiNotificationType =
  | 'payment_due'
  | 'lesson_reminder'
  | 'missed_lesson'
  | 'audit_alert'
  | 'end_of_day'
  | 'security'
  | 'system'

// One row of GET /notifications. A notification is addressed either to a role
// (recipient_role) or to a specific user (recipient_user) — never neither.
export interface ApiNotification {
  id:             string
  recipient_role: 'manager' | 'secretary' | 'instructor' | null
  recipient_user: string | null
  type:           ApiNotificationType
  title:          string
  body:           string | null
  link_url:       string | null
  is_read:        boolean
  created_at:     string
}

// GET /notifications returns the recipient's newest notifications plus a total
// unread count (accurate even past the list cap, so the bell badge is right).
export interface NotificationsResult {
  notifications: ApiNotification[]
  unreadCount:   number
}

export async function listNotifications(): Promise<NotificationsResult> {
  try {
    const { data } = await api.get<NotificationsResult>('/notifications')
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

// PATCH /notifications/:id/read — mark one read (204, no body). A mutation, so
// it stays a plain awaited call: the caller awaits, then refetches the feed.
export async function markNotificationRead(id: string): Promise<void> {
  try {
    await api.patch(`/notifications/${id}/read`)
  } catch (err) {
    throw toApiError(err)
  }
}

// PATCH /notifications/read-all — clear the unread badge; returns how many were
// flipped.
export async function markAllNotificationsRead(): Promise<number> {
  try {
    const { data } = await api.patch<{ updated: number }>('/notifications/read-all')
    return data.updated
  } catch (err) {
    throw toApiError(err)
  }
}
