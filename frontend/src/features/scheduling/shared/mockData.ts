import type { SlotAssignment } from './types'

// Seeded so the grid isn't empty: Monday 8-9 (1), Wednesday 8-9 (2), Wednesday
// 9-10 (1), Friday 1-2 (1). Uses real students from the Students module —
// Yaw Darko (QS-2025-005) has finished all 15 lessons, so he's deliberately
// left off the board.
export const INITIAL_GRID: Record<string, SlotAssignment[]> = {
  'MON-8': [{ studentId: 'QS-2025-001' }],
  'WED-8': [
    { studentId: 'QS-2025-003' },
    { studentId: 'QS-2025-002' },
  ],
  'WED-9':  [{ studentId: 'QS-2025-004' }],
  'FRI-13': [{ studentId: 'QS-2025-006' }],
}
