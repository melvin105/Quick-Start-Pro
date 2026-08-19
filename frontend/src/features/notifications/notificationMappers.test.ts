import { describe, it, expect } from 'vitest'
import { CreditCard, Bell } from 'lucide-react'
import { formatNotificationTime, toNotificationView } from './notificationMappers'
import type { ApiNotification } from './notificationsService'

// Fixed reference point: Wed 12 Aug 2026, 15:30 local time.
const NOW = new Date(2026, 7, 12, 15, 30, 0)

// Build an ISO string for a local date/time so the day-diff maths is unaffected
// by the test machine's timezone.
function localIso(y: number, m: number, d: number, h = 10, min = 0): string {
  return new Date(y, m, d, h, min, 0).toISOString()
}

describe('formatNotificationTime', () => {
  it('shows a compact lowercase time for today', () => {
    expect(formatNotificationTime(localIso(2026, 7, 12, 17, 5), NOW)).toBe('5:05pm')
  })

  it('shows "Yesterday" for the previous day', () => {
    expect(formatNotificationTime(localIso(2026, 7, 11), NOW)).toBe('Yesterday')
  })

  it('shows the weekday within the last week', () => {
    // Sun 9 Aug 2026 is 3 days before the reference Wednesday.
    expect(formatNotificationTime(localIso(2026, 7, 9), NOW)).toBe('Sun')
  })

  it('shows a short date once older than a week', () => {
    expect(formatNotificationTime(localIso(2026, 7, 1), NOW)).toBe('1 Aug')
  })

  it('returns an empty string for an unparseable timestamp', () => {
    expect(formatNotificationTime('not-a-date', NOW)).toBe('')
  })
})

const row: ApiNotification = {
  id: 'n-1',
  recipient_role: 'manager',
  recipient_user: null,
  type: 'payment_due',
  title: 'Payment overdue',
  body: 'DP-2026-0001 has an outstanding balance.',
  link_url: '/students/1',
  is_read: false,
  created_at: localIso(2026, 7, 12, 9, 0),
}

describe('toNotificationView', () => {
  it('maps a row to its presentation model with type-specific icon and accent', () => {
    const view = toNotificationView(row, NOW)
    expect(view).toMatchObject({
      id: 'n-1',
      title: 'Payment overdue',
      body: 'DP-2026-0001 has an outstanding balance.',
      linkUrl: '/students/1',
      isRead: false,
      timeLabel: '9:00am',
      icon: CreditCard,
      accent: 'bg-danger-bg text-danger',
    })
  })

  it('falls back to the system style for an unknown type', () => {
    const view = toNotificationView({ ...row, type: 'mystery' as ApiNotification['type'] }, NOW)
    expect(view.icon).toBe(Bell)
    expect(view.accent).toBe('bg-gray-100 text-gray-600')
  })
})
