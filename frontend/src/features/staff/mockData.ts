import type { StaffMember } from './types'

// First names match the `driverName` values used across the attendance
// feature (features/attendance/shared/mockData.ts) so lesson/salary lookups
// resolve correctly.
export const STAFF: StaffMember[] = [
  { id: 'staff-mercy',   name: 'Mercy Osei',    role: 'secretary',  phone: '024 555 1122', email: 'mercy@quickstartpro.gh',   addedDate: '2025-01-15' },
  { id: 'staff-obed',    name: 'Obed Antwi',    role: 'instructor', phone: '024 555 2233', addedDate: '2025-01-20' },
  { id: 'staff-patrick', name: 'Patrick Owusu', role: 'instructor', phone: '024 555 3344', addedDate: '2025-02-10' },
  { id: 'staff-fred',    name: 'Fred Boateng',  role: 'instructor', phone: '024 555 4455', addedDate: '2025-03-05' },
]
