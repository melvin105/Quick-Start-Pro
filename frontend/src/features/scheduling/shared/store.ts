import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Day, SlotAssignment } from './types'
import { INITIAL_GRID } from './mockData'
import { slotKey, isSlotFull } from './utils'

interface SchedulingState {
  grid: Record<string, SlotAssignment[]>
  assign: (day: Day, hour: number, studentId: string) => void
  clear: (day: Day, hour: number, studentId: string) => void
  move: (fromDay: Day, fromHour: number, toDay: Day, toHour: number, studentId: string) => void
  removeStudentFromAllSlots: (studentId: string) => void
}

// Persisted so the schedule is consistent everywhere it's read from — most
// importantly, the public /check-in page (a separate tab/device) needs to
// see the same grid the secretary just edited, not a fresh copy of the mock
// seed, or a newly-scheduled student's self check-in falls back to an
// unscheduled walk-in instead of resolving to their actual slot.
const useSchedulingStore = create<SchedulingState>()(
  persist(
    (set) => ({
  grid: INITIAL_GRID,

  assign: (day, hour, studentId) => set((state) => {
    const key = slotKey(day, hour)
    const existing = state.grid[key] ?? []
    if (existing.some((a) => a.studentId === studentId)) return state
    if (isSlotFull(existing)) return state
    return { grid: { ...state.grid, [key]: [...existing, { studentId }] } }
  }),

  clear: (day, hour, studentId) => set((state) => {
    const key = slotKey(day, hour)
    const existing = state.grid[key] ?? []
    return { grid: { ...state.grid, [key]: existing.filter((a) => a.studentId !== studentId) } }
  }),

  // Repositions a single assignment (e.g. dragging a chip to another slot) —
  // removed from the origin slot and added to the destination in one update,
  // rather than clearing and re-assigning as two separate actions.
  move: (fromDay, fromHour, toDay, toHour, studentId) => set((state) => {
    const fromKey = slotKey(fromDay, fromHour)
    const toKey = slotKey(toDay, toHour)
    const fromExisting = state.grid[fromKey] ?? []
    const toExisting = state.grid[toKey] ?? []
    if (fromKey === toKey || toExisting.some((a) => a.studentId === studentId) || isSlotFull(toExisting)) {
      return state
    }
    return {
      grid: {
        ...state.grid,
        [fromKey]: fromExisting.filter((a) => a.studentId !== studentId),
        [toKey]: [...toExisting, { studentId }],
      },
    }
  }),

  // A student who's used up all their lessons has nothing left to attend —
  // clear them out of every slot they're currently holding.
  removeStudentFromAllSlots: (studentId) => set((state) => {
    const grid: Record<string, SlotAssignment[]> = {}
    for (const [key, assignments] of Object.entries(state.grid)) {
      grid[key] = assignments.filter((a) => a.studentId !== studentId)
    }
    return { grid }
  }),
    }),
    { name: 'qsp-scheduling' },
  ),
)

export default useSchedulingStore
