import { useState } from 'react'
import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import { ROLE_LABELS } from '../../lib/constants'

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = (user?.name ?? '?')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="h-16 shrink-0 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 border-b border-gray-200 bg-white">
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

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
        <button
          type="button"
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-warning" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((p) => !p)}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11.5px] font-semibold shrink-0">
              {initials}
            </div>
            <span className="hidden sm:block text-[13.5px] font-medium text-gray-900">{user?.name}</span>
            <ChevronDown size={15} className={`text-gray-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
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
