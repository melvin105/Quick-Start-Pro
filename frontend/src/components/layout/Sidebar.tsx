import { NavLink } from 'react-router-dom'
import { Car, LogOut } from 'lucide-react'
import { NAV_ITEMS, SETTINGS_ITEM } from './navItems'
import { useAuth } from '../../features/auth/useAuth'
import type { Role } from '../../lib/constants'

interface SidebarProps {
  role: Role
  onNavigate?: () => void
}

function navLinkClasses({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
    isActive
      ? 'bg-brand-50 text-brand-600'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`
}

export default function Sidebar({ role, onNavigate }: SidebarProps) {
  const { logout } = useAuth()
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex items-center gap-2.5 px-5 h-16 shrink-0 border-b border-gray-200">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <Car size={18} className="text-white" />
        </div>
        <span className="text-[15px] font-semibold text-gray-900 truncate">Quick Start Pro</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={navLinkClasses}>
            <Icon size={17} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-gray-200 space-y-1 shrink-0">
        <NavLink to={SETTINGS_ITEM.to} onClick={onNavigate} className={navLinkClasses}>
          <SETTINGS_ITEM.icon size={17} className="shrink-0" />
          {SETTINGS_ITEM.label}
        </NavLink>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-danger hover:bg-danger-bg transition-colors"
        >
          <LogOut size={17} className="shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )
}
