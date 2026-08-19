import { useNavigate } from 'react-router-dom'
import { BellOff } from 'lucide-react'
import { resolveRoleLink } from '../../lib/constants'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import NotificationRow from './NotificationRow'
import { useNotificationFeed } from './useNotificationFeed'
import type { NotificationView } from './notificationMappers'

// Shared Notifications screen (screen 11) — mounted under both role route trees,
// reached from the topbar bell's "View all". Same feed and view models as the
// panel, just full-width with room for longer bodies.
export default function NotificationsPage() {
  const navigate = useNavigate()
  const { items, unreadCount, loading, error, refetch, markRead, markAll } = useNotificationFeed()

  const selectNotification = (view: NotificationView) => {
    if (!view.isRead) void markRead(view.id)
    if (view.linkUrl) navigate(resolveRoleLink(view.linkUrl))
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAll()}
            className="text-[13px] font-medium text-brand-600 hover:text-brand-700 transition-colors shrink-0"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading notifications…" />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center text-center gap-3 px-4 py-16">
          <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
            <BellOff size={24} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-900">You're all caught up</p>
            <p className="text-[13px] text-gray-500 mt-1">New notifications will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2 divide-y divide-gray-100">
          {items.map((view) => (
            <NotificationRow key={view.id} view={view} onClick={() => selectNotification(view)} />
          ))}
        </div>
      )}
    </div>
  )
}
