import { slotKey } from './utils'
import type { ApiScheduleSlot, ApiSlotAssignment, ListSlotsResult } from './schedulingService'

// The shape the grid components render from: one cell per Mon–Sat slot, keyed
// `${DAY}-${hour}` (via slotKey) so the existing day/hour layout is unchanged.
// Each cell keeps its real slot id (for assign/unassign) and per-slot capacity,
// and each assignment carries the student's display data inline — no students
// store lookup needed.
export interface CellAssignment {
  studentId:        string
  studentNumber:    string
  name:             string
  lessonsRemaining: number
}

export interface ScheduleCell {
  slotId:      string
  capacity:    number
  isActive:    boolean
  assignments: CellAssignment[]
}

export type ScheduleGridData = Record<string, ScheduleCell>

export function toCellAssignment(a: ApiSlotAssignment): CellAssignment {
  return {
    studentId:        a.studentId,
    studentNumber:    a.studentNumber,
    name:             a.studentName,
    lessonsRemaining: a.lessonsRemaining,
  }
}

// Rebuilds the day-hour keyed grid from the API slot list. Slots with no Mon–Sat
// day (day_of_week outside 1–6) have no column on this board and are dropped.
export function toScheduleGrid(result: ListSlotsResult): ScheduleGridData {
  const grid: ScheduleGridData = {}
  for (const slot of result.slots) {
    if (!slot.day) continue
    grid[slotKey(slot.day, slot.startHour)] = toScheduleCell(slot)
  }
  return grid
}

function toScheduleCell(slot: ApiScheduleSlot): ScheduleCell {
  return {
    slotId:      slot.id,
    capacity:    slot.capacity,
    isActive:    slot.isActive,
    assignments: slot.assignments.map(toCellAssignment),
  }
}

// A cell is full once it holds as many assignments as its slot capacity. Undefined
// cells (an hour with no seeded slot) are treated as not-full/empty.
export function isCellFull(cell: ScheduleCell | undefined): boolean {
  return cell ? cell.assignments.length >= cell.capacity : false
}
