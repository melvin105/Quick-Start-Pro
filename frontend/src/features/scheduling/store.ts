import { create } from 'zustand'
import type { Day, SlotAssignment } from './types'
import { INITIAL_GRID } from './mockData'
import { slotKey } from './utils'

interface SchedulingState {
  grid: Record<string, SlotAssignment[]>
  assign: (day: Day, hour: number, studentId: string, lessonsRemaining: number) => void
  clear: (day: Day, hour: number, studentId: string) => void
}

const useSchedulingStore = create<SchedulingState>((set) => ({
  grid: INITIAL_GRID,

  assign: (day, hour, studentId, lessonsRemaining) => set((state) => {
    const key = slotKey(day, hour)
    const existing = state.grid[key] ?? []
    if (existing.some((a) => a.studentId === studentId)) return state
    return { grid: { ...state.grid, [key]: [...existing, { studentId, lessonsRemaining }] } }
  }),

  clear: (day, hour, studentId) => set((state) => {
    const key = slotKey(day, hour)
    const existing = state.grid[key] ?? []
    return { grid: { ...state.grid, [key]: existing.filter((a) => a.studentId !== studentId) } }
  }),
}))

export default useSchedulingStore
