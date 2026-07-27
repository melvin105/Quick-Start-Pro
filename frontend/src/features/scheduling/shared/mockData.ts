import type { ScheduleStudent, SlotAssignment } from './types'

// No students module wired up yet — self-contained mock roster for the
// scheduling search, per spec ("if none, seed mock student names with IDs").
export const MOCK_STUDENTS: ScheduleStudent[] = [
  { id: 'QS-2026-101', name: 'Priscilla Mensah',    enrolment: 'Driving + Licence' },
  { id: 'QS-2026-102', name: 'Janelle Owusu',       enrolment: 'Driving Only' },
  { id: 'QS-2026-103', name: 'Patterson Marfo',     enrolment: 'Licence Only' },
  { id: 'QS-2026-104', name: 'Peter Amoah',         enrolment: 'Driving Only' },
  { id: 'QS-2026-105', name: 'Jacob Tetteh Asante', enrolment: 'Driving + Licence' },
  { id: 'QS-2026-106', name: 'Mary Tetteh',         enrolment: 'Licence Only' },
  { id: 'QS-2026-107', name: 'Kenneth Owusu',       enrolment: 'Driving Only' },
  { id: 'QS-2026-108', name: 'Esther Amoah',        enrolment: 'Driving + Licence' },
  { id: 'QS-2026-109', name: 'Akwasi Asante',       enrolment: 'Driving Only' },
  { id: 'QS-2026-110', name: 'Amy Gyasi',           enrolment: 'Licence Only' },
  { id: 'QS-2026-111', name: 'Florens Yeboah',      enrolment: 'Driving + Licence' },
]

// Seeded so the grid isn't empty: Monday 8-9 (1), Wednesday 8-9 (2, one
// nearing end for the amber state), Wednesday 9-10 (1), Friday 1-2 (1).
export const INITIAL_GRID: Record<string, SlotAssignment[]> = {
  'MON-8': [{ studentId: 'QS-2026-107', lessonsRemaining: 14 }],
  'WED-8': [
    { studentId: 'QS-2026-101', lessonsRemaining: 3 },
    { studentId: 'QS-2026-102', lessonsRemaining: 11 },
  ],
  'WED-9':  [{ studentId: 'QS-2026-103', lessonsRemaining: 8 }],
  'FRI-13': [{ studentId: 'QS-2026-111', lessonsRemaining: 6 }],
}
