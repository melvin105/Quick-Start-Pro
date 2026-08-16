// ─── User Roles ───────────────────────────────────────────────────────────────
// The only two roles that can log in. This is the agreed auth vocabulary shared
// with the backend (see backend authService LOGIN_ROLES) — the manager is
// labelled "Manager" in the UI but the role value is 'manager' everywhere,
// including on the wire. Instructors are staff records only, not login roles
// (see StaffRole in features/staff/types.ts).
export const ROLES = {
  MANAGER:   'manager',
  SECRETARY: 'secretary',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  manager:   'Manager',
  secretary: 'Secretary',
}

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value: value as Role,
  label,
}))

// ─── App base URL (for QR codes) ────────────────────────────────────────────────
// Falls back to the current origin so QR codes resolve correctly even if
// VITE_APP_URL isn't set (e.g. a fresh clone or an unfamiliar deploy target).
export const APP_URL = import.meta.env.VITE_APP_URL ?? window.location.origin

// ─── Route paths ──────────────────────────────────────────────────────────────
// Every app route lives under a role-prefixed base ('/secretary' or '/manager').
// ROUTES.X below are getters so that a single call site (used by both the
// secretary and manager copy of a shared page/component) always resolves to
// the path for whichever role is currently signed in, without each caller
// having to know or pass its own role.
import useAuthStore from '../features/auth/authStore'

const ROLE_BASE: Record<Role, string> = {
  manager:   '/manager',
  secretary: '/secretary',
}

function currentBase(): string {
  const role = useAuthStore.getState().user?.role
  return (role && ROLE_BASE[role]) || '/secretary'
}

export const ROUTES = {
  LOGIN:    '/login',
  CHECK_IN: '/check-in',
  REGISTER: '/register',

  get DASHBOARD()  { return `${currentBase()}/dashboard` },
  get STUDENTS()   { return `${currentBase()}/students` },
  get STUDENTS_LICENCES() { return `${currentBase()}/students/licences` },
  get STUDENTS_REGISTER() { return `${currentBase()}/students/register` },
  get STUDENTS_REGISTER_QR() { return `${currentBase()}/students/register/qr` },
  get STUDENT_PROFILE() { return `${currentBase()}/students/:id` },
  get STUDENT_EDIT()    { return `${currentBase()}/students/:id/edit` },
  get STUDENT_LICENCE() { return `${currentBase()}/students/:id/licence` },
  get SCHEDULING() { return `${currentBase()}/schedule` },
  get ATTENDANCE() { return `${currentBase()}/attendance` },
  get ATTENDANCE_HISTORY() { return `${currentBase()}/attendance/history` },
  get PAYMENTS()   { return `${currentBase()}/payments` },
  get RECORDS()    { return `${currentBase()}/records` },

  // Manager-only screens — no secretary equivalent exists.
  FINANCES:       '/manager/finances',
  REPORTS:        '/manager/reports',
  REPORTS_DRIVER: '/manager/reports/driver',
  STAFF:          '/manager/staff',
  AUDIT_LOG:      '/manager/audit-log',
  SETTINGS:       '/manager/settings',
}

export function staffProfilePath(id: string) {
  return `/manager/staff/${id}`
}

// ─── Role → default redirect after login ──────────────────────────────────────
export const ROLE_HOME: Record<Role, string> = {
  manager:   '/manager/dashboard',
  secretary: '/secretary/dashboard',
}
