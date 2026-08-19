import { PanelLeft } from 'lucide-react'
import logo from '../../assets/Logo.svg'

interface TopBrandBarProps {
  collapsed:          boolean
  onToggleCollapse:   () => void
  onOpenMobileMenu:   () => void
}

export default function TopBrandBar({ collapsed, onToggleCollapse, onOpenMobileMenu }: TopBrandBarProps) {
  return (
    <div
      className={`flex items-center h-16 shrink-0 gap-2 px-4 border-r border-gray-200 transition-[width] duration-200 ${
        collapsed ? 'lg:w-[72px] lg:flex-col lg:justify-center lg:gap-1 lg:px-2' : 'lg:w-64 lg:px-4'
      }`}
    >
      <img src={logo} alt="Quick Start Pro" className="w-7 h-7 shrink-0" />
      <span className={`text-[15px] font-semibold text-gray-900 truncate ${collapsed ? 'lg:hidden' : ''}`}>
        Quick Start Pro
      </span>

      {/* Mobile / tablet: opens the drawer */}
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
        aria-label="Open menu"
      >
        <PanelLeft size={19} />
      </button>

      {/* Desktop: collapses/expands the sidebar */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="hidden lg:flex p-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <PanelLeft size={16} />
      </button>
    </div>
  )
}
