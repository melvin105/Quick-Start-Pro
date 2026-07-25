// ─── User Roles ───────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:      'admin',
  SECRETARY:  'secretary',
  INSTRUCTOR: 'instructor',
  STUDENT:    'student',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  admin:      'Administrator',
  secretary:  'Secretary',
  instructor: 'Instructor',
  student:    'Student',
}

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value: value as Role,
  label,
}))

// ─── Route paths ──────────────────────────────────────────────────────────────
export const ROUTES = {
  LOGIN:      '/login',
  DASHBOARD:  '/dashboard',
  STUDENTS:   '/students',
  SCHEDULING: '/scheduling',
  ATTENDANCE: '/attendance',
  PAYMENTS:   '/payments',
  RECORDS:    '/records',
  SETTINGS:   '/settings',
} as const

// ─── Role → default redirect after login ──────────────────────────────────────
export const ROLE_HOME: Record<Role, string> = {
  admin:      ROUTES.DASHBOARD,
  secretary:  ROUTES.DASHBOARD,
  instructor: ROUTES.SCHEDULING,
  student:    ROUTES.DASHBOARD,
}
