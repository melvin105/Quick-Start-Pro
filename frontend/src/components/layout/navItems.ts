import {
  LayoutDashboard,
  Users,
  CalendarClock,
  ClipboardCheck,
  CreditCard,
  FileText,
  Wallet,
  BarChart3,
  UserCog,
  History,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { ROLES, ROUTES, type Role } from '../../lib/constants'

export interface NavItem {
  label: string
  to:    string
  icon:  LucideIcon
  roles?: Role[]
}

// Scrollable main navigation. Manager-only routes are appended inline
// (no section header) and filtered per role in the sidebar.
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  to: ROUTES.DASHBOARD,  icon: LayoutDashboard },
  { label: 'Students',   to: ROUTES.STUDENTS,   icon: Users },
  { label: 'Scheduling', to: ROUTES.SCHEDULING, icon: CalendarClock },
  { label: 'Attendance', to: ROUTES.ATTENDANCE, icon: ClipboardCheck },
  { label: 'Payments',   to: ROUTES.PAYMENTS,   icon: CreditCard },
  { label: 'Records',    to: ROUTES.RECORDS,    icon: FileText },
  { label: 'Finances',   to: ROUTES.FINANCES,   icon: Wallet,    roles: [ROLES.ADMIN] },
  { label: 'Reports',    to: ROUTES.REPORTS,    icon: BarChart3, roles: [ROLES.ADMIN] },
  { label: 'Staff',      to: ROUTES.STAFF,      icon: UserCog,   roles: [ROLES.ADMIN] },
  { label: 'Audit Log',  to: ROUTES.AUDIT_LOG,  icon: History,   roles: [ROLES.ADMIN] },
]

// Pinned to the bottom of the sidebar, below the scrollable nav.
export const SETTINGS_ITEM: NavItem = {
  label: 'Settings',
  to:    ROUTES.SETTINGS,
  icon:  Settings,
}
