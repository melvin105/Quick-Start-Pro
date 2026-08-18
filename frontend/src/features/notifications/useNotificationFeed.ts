import { useApiResource } from '../../lib/useApiResource'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notificationsService'
import { toNotificationView, type NotificationView } from './notificationMappers'

export interface NotificationFeed {
  items:       NotificationView[]
  unreadCount: number
  loading:     boolean
  error:       ReturnType<typeof useApiResource>['error']
  refetch:     () => Promise<void>
  markRead:    (id: string) => Promise<void>
  markAll:     () => Promise<void>
}

// Shared read + mark logic for the bell panel and the Notifications page, so
// both render the same view models and mutate the feed the same way. The feed
// loads once when its host mounts (the topbar lives for the whole session) and
// refetches after a mark, keeping the unread badge in step.
export function useNotificationFeed(): NotificationFeed {
  const { data, loading, error, refetch } = useApiResource(() => listNotifications())

  const items = (data?.notifications ?? []).map((n) => toNotificationView(n))
  const unreadCount = data?.unreadCount ?? 0

  const markRead = async (id: string) => {
    await markNotificationRead(id)
    await refetch()
  }

  const markAll = async () => {
    if (unreadCount === 0) return
    await markAllNotificationsRead()
    await refetch()
  }

  return { items, unreadCount, loading, error, refetch, markRead, markAll }
}
