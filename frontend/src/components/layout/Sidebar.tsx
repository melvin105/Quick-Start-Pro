import { NavLink } from 'react-router-dom'
import { Car, LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NAV_ITEMS, SETTINGS_ITEM } from './navItems'
import { useAuth } from '../../features/auth/useAuth'
import type { Role } from '../../lib/constants'

interface SidebarProps {
  role: Role
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

function navLinkClasses({ isActive }: { isActive: boolean }, collapsed: boolean) {
  return `flex items-center rounded-lg text-[13.5px] font-medium transition-colors ${
    collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
  } ${
    isActive
      ? 'bg-brand-50 text-brand-600'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`
}

export default function Sidebar({ role, onNavigate, collapsed = false, onToggleCollapse }: SidebarProps) {
  const { logout } = useAuth()
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div
        className={`flex items-center h-16 shrink-0 border-b border-gray-200 ${
          collapsed ? 'justify-center px-2' : 'gap-2.5 px-5'
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <Car size={18} className="text-white" />
        </div>
        {!collapsed && <span className="text-[15px] font-semibold text-gray-900 truncate">Quick Start Pro</span>}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={(state) => navLinkClasses(state, collapsed)}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-gray-200 space-y-1 shrink-0">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : undefined}
            className={`w-full flex items-center rounded-lg text-[13.5px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors ${
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            {collapsed ? <ChevronsRight size={17} className="shrink-0" /> : <ChevronsLeft size={17} className="shrink-0" />}
            {!collapsed && 'Collapse'}
          </button>
        )}
        <NavLink
          to={SETTINGS_ITEM.to}
          onClick={onNavigate}
          title={collapsed ? SETTINGS_ITEM.label : undefined}
          className={(state) => navLinkClasses(state, collapsed)}
        >
          <SETTINGS_ITEM.icon size={17} className="shrink-0" />
          {!collapsed && SETTINGS_ITEM.label}
        </NavLink>
        <button
          type="button"
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center rounded-lg text-[13.5px] font-medium text-danger hover:bg-danger-bg transition-colors ${
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  )
}
