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

// ROUTES.X below resolves to the currently signed-in user's role-prefixed
// path, so this must be built fresh per render (via a function) rather than
// as a static module-level array — otherwise it would freeze whatever path
// was current at first import, before login.
export function getNavItems(role: Role): NavItem[] {
  const items: NavItem[] = [
    { label: 'Dashboard',  to: ROUTES.DASHBOARD,  icon: LayoutDashboard },
    { label: 'Students',   to: ROUTES.STUDENTS,   icon: Users },
    { label: 'Scheduling', to: ROUTES.SCHEDULING, icon: CalendarClock },
    { label: 'Attendance', to: ROUTES.ATTENDANCE, icon: ClipboardCheck },
    { label: 'Payments',   to: ROUTES.PAYMENTS,   icon: CreditCard, roles: [ROLES.SECRETARY] },
    { label: 'Records',    to: ROUTES.RECORDS,    icon: FileText },
    { label: 'Finances',   to: ROUTES.FINANCES,   icon: Wallet,    roles: [ROLES.ADMIN] },
    { label: 'Reports',    to: ROUTES.REPORTS,    icon: BarChart3, roles: [ROLES.ADMIN] },
    { label: 'Staff',      to: ROUTES.STAFF,      icon: UserCog,   roles: [ROLES.ADMIN] },
    { label: 'Audit Log',  to: ROUTES.AUDIT_LOG,  icon: History,   roles: [ROLES.ADMIN] },
  ]
  return items.filter((item) => !item.roles || item.roles.includes(role))
}

// Pinned to the bottom of the sidebar, below the scrollable nav. Manager-only.
export const SETTINGS_ITEM: NavItem = {
  label: 'Settings',
  to:    ROUTES.SETTINGS,
  icon:  Settings,
}
