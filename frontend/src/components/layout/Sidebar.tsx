import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { getNavItems, SETTINGS_ITEM } from './navItems'
import { useAuth } from '../../features/auth/useAuth'
import { ROLES, type Role } from '../../lib/constants'
import logo from '../../assets/Logo.svg'

interface SidebarProps {
  role:       Role
  onNavigate?: () => void
  collapsed?: boolean
  showHeader?: boolean
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

export default function Sidebar({ role, onNavigate, collapsed = false, showHeader = false }: SidebarProps) {
  const { logout } = useAuth()
  const items = getNavItems(role)

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Standalone (mobile drawer) usage needs its own brand header — the
          desktop aside gets one from AppShell's TopBrandBar instead. */}
      {showHeader && (
        <div className="flex items-center h-16 shrink-0 gap-2.5 px-5 border-b border-gray-200">
          <img src={logo} alt="Quick Start Pro" className="w-7 h-7 shrink-0" />
          <span className="text-[15px] font-semibold text-gray-900 truncate">Quick Start Pro</span>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4 space-y-1">
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
        {role === ROLES.MANAGER && (
          <NavLink
            to={SETTINGS_ITEM.to}
            onClick={onNavigate}
            title={collapsed ? SETTINGS_ITEM.label : undefined}
            className={(state) => navLinkClasses(state, collapsed)}
          >
            <SETTINGS_ITEM.icon size={17} className="shrink-0" />
            {!collapsed && SETTINGS_ITEM.label}
          </NavLink>
        )}
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
