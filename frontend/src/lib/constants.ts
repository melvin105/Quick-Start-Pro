// ─── User Roles ───────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:      'admin',
  SECRETARY:  'secretary',
  INSTRUCTOR: 'instructor',
  STUDENT:    'student',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  admin:      'Manager',
  secretary:  'Secretary',
  instructor: 'Instructor',
  student:    'Student',
}

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value: value as Role,
  label,
}))

// ─── Route paths ──────────────────────────────────────────────────────────────
// Every app route lives under a role-prefixed base ('/secretary' or '/manager').
// ROUTES.X below are getters so that a single call site (used by both the
// secretary and manager copy of a shared page/component) always resolves to
// the path for whichever role is currently signed in, without each caller
// having to know or pass its own role.
import useAuthStore from '../features/auth/authStore'

const ROLE_BASE: Partial<Record<Role, string>> = {
  admin:     '/manager',
  secretary: '/secretary',
}

function currentBase(): string {
  const role = useAuthStore.getState().user?.role
  return (role && ROLE_BASE[role]) || '/secretary'
}

export const ROUTES = {
  LOGIN:    '/login',
  CHECK_IN: '/check-in/:code',

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
  FINANCES:  '/manager/finances',
  REPORTS:   '/manager/reports',
  STAFF:     '/manager/staff',
  AUDIT_LOG: '/manager/audit-log',
  SETTINGS:  '/manager/settings',
}

// ─── Role → default redirect after login ──────────────────────────────────────
export const ROLE_HOME: Record<Role, string> = {
  admin:      '/manager/dashboard',
  secretary:  '/secretary/dashboard',
  instructor: '/login',
  student:    '/login',
}
