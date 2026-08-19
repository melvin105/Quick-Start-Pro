import type { LucideIcon } from 'lucide-react'
import { CreditCard, CalendarClock, CalendarX, ShieldAlert, Clock, Lock, Bell } from 'lucide-react'
import type { ApiNotification, ApiNotificationType } from './notificationsService'

// Presentation model the panel and the Notifications page both render, so the
// icon, accent colour and relative time are decided in one place.
export interface NotificationView {
  id:        string
  title:     string
  body:      string | null
  timeLabel: string
  linkUrl:   string | null
  isRead:    boolean
  icon:      LucideIcon
  // Tailwind classes for the leading icon chip (background + text colour).
  accent:    string
}

// Each notification type gets an icon and a severity accent matching the design
// doc's notifications screen (amber = attention, red = money/overdue, neutral =
// informational).
const TYPE_STYLE: Record<ApiNotificationType, { icon: LucideIcon; accent: string }> = {
  payment_due:     { icon: CreditCard,    accent: 'bg-danger-bg text-danger' },
  missed_lesson:   { icon: CalendarX,     accent: 'bg-danger-bg text-danger' },
  lesson_reminder: { icon: CalendarClock, accent: 'bg-brand-50 text-brand-600' },
  audit_alert:     { icon: ShieldAlert,   accent: 'bg-warning-bg text-warning' },
  end_of_day:      { icon: Clock,         accent: 'bg-warning-bg text-warning' },
  security:        { icon: Lock,          accent: 'bg-gray-100 text-gray-600' },
  system:          { icon: Bell,          accent: 'bg-gray-100 text-gray-600' },
}

const TIME_FMT = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true })
const WEEKDAY_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'short' })
const DATE_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

// Compact, glanceable timestamp: the time for today, "Yesterday", the weekday
// within the last week, else a short date. `now` is injectable for tests.
export function formatNotificationTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''
  const dayDiff = Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000)
  if (dayDiff <= 0) return TIME_FMT.format(then).toLowerCase().replace(/\s/g, '')
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff < 7) return WEEKDAY_FMT.format(then)
  return DATE_FMT.format(then)
}

export function toNotificationView(row: ApiNotification, now?: Date): NotificationView {
  const style = TYPE_STYLE[row.type] ?? TYPE_STYLE.system
  return {
    id:        row.id,
    title:     row.title,
    body:      row.body,
    timeLabel: formatNotificationTime(row.created_at, now),
    linkUrl:   row.link_url,
    isRead:    row.is_read,
    icon:      style.icon,
    accent:    style.accent,
  }
}
