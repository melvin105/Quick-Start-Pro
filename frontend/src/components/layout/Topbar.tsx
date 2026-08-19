import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellOff, ChevronDown, LogOut, Search } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { ROLE_LABELS, ROUTES, resolveRoleLink } from '../../lib/constants'
import { useNotificationFeed } from '../../features/notifications/useNotificationFeed'
import NotificationRow from '../../features/notifications/NotificationRow'
import type { NotificationView } from '../../features/notifications/notificationMappers'

// Which topbar dropdown is open. Only one may be open at a time, so a single
// union is simpler than a boolean per menu (and one open menu closes the other).
type OpenMenu = 'none' | 'notifications' | 'account'

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState<OpenMenu>('none')

  const { items, unreadCount, loading, error, markRead, markAll } = useNotificationFeed()

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const toggle = (menu: OpenMenu) => setOpen((current) => (current === menu ? 'none' : menu))

  // Open a notification: close the panel, mark it read (if it wasn't), then
  // follow its link when it has one.
  const selectNotification = (view: NotificationView) => {
    setOpen('none')
    if (!view.isRead) void markRead(view.id)
    if (view.linkUrl) navigate(resolveRoleLink(view.linkUrl))
  }

  return (
    <header className="h-16 shrink-0 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 bg-white">
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full pl-9 pr-3 py-2 text-[13.5px] bg-gray-100 rounded-lg border border-transparent placeholder:text-gray-500
              focus:outline-none focus:bg-white focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/10 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        <div className="relative">
          <button
            type="button"
            onClick={() => toggle('notifications')}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
            aria-expanded={open === 'notifications'}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-warning text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open === 'notifications' && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen('none')} />
              <div className="absolute right-0 z-20 mt-1 w-[calc(100vw-2rem)] max-w-sm bg-white border border-gray-200 rounded-lg shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-[13.5px] font-semibold text-gray-900">Notifications</p>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => void markAll()}
                      className="text-[12px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {loading ? (
                  <p className="px-4 py-8 text-center text-[12.5px] text-gray-500">Loading…</p>
                ) : error ? (
                  <p className="px-4 py-8 text-center text-[12.5px] text-danger">Couldn't load notifications.</p>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-2 px-4 py-8">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                      <BellOff size={18} />
                    </div>
                    <p className="text-[13px] font-medium text-gray-700">You're all caught up</p>
                    <p className="text-[12px] text-gray-500">New notifications will appear here.</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto px-2 py-1">
                    {items.map((view) => (
                      <NotificationRow key={view.id} view={view} onClick={() => selectNotification(view)} />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { setOpen('none'); navigate(ROUTES.NOTIFICATIONS) }}
                  className="w-full px-4 py-2.5 text-[12.5px] font-medium text-brand-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                >
                  View all
                </button>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggle('account')}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-expanded={open === 'account'}
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11.5px] font-semibold shrink-0">
              {initials}
            </div>
            <span className="hidden sm:block text-[13.5px] font-medium text-gray-900">{user?.name}</span>
            <ChevronDown size={15} className={`text-gray-500 transition-transform ${open === 'account' ? 'rotate-180' : ''}`} />
          </button>

          {open === 'account' && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen('none')} />
              <div className="absolute right-0 z-20 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-card overflow-hidden">
                <div className="px-3 py-2.5 border-b border-gray-100">
                  <p className="text-[13px] font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-[11.5px] text-gray-500">{user ? ROLE_LABELS[user.role] : ''}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-danger hover:bg-danger-bg transition-colors"
                >
                  <LogOut size={15} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
