import type { CoursePackage, UserAccount } from './types'

export const PACKAGES: CoursePackage[] = [
  { id: 'pkg-1', name: 'Manual – Standard',    lessons: 12, price: 1800, status: 'active' },
  { id: 'pkg-2', name: 'Manual – Instructor',  lessons: 22, price: 2750, status: 'active' },
  { id: 'pkg-3', name: 'Automatic – Standard', lessons: 10, price: 2000, status: 'active' },
  { id: 'pkg-4', name: 'Weekend Crash Course', lessons: 6,  price: 1500, status: 'active' },
]

export const USER_ACCOUNTS: UserAccount[] = [
  { id: 'user-1', name: 'John Mensah',   email: 'john@quickstartpro.gh',    role: 'admin',     status: 'active' },
  { id: 'user-2', name: 'Mercy Osei',    email: 'mercy@quickstartpro.gh',   role: 'secretary', status: 'active' },
  {
    id: 'user-3', name: 'Kwadama Asare', email: 'kwadama@quickstartpro.gh', role: 'secretary', status: 'locked',
    failedAttempts: 3, lastFailedAttempt: '2026-07-19',
  },
]
