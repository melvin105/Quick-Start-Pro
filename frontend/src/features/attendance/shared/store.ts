import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AttendanceRecord, AttendanceStatus } from './types'
import { INITIAL_ATTENDANCE, INSTRUCTORS, todayIso } from './mockData'
import { isAutoAbsentDue } from './utils'
import useStudentsStore from '../../students/shared/store'
import useSchedulingStore from '../../scheduling/shared/store'
import { MAX_LESSONS, remainingLessons } from '../../students/shared/utils'
import { getTodayColumn, START_HOURS, slotKey, formatRangeShort } from '../../scheduling/shared/utils'

function nowLabel() {
  return new Date()
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .toLowerCase()
    .replace(' ', '')
}

// A lesson only "counts" the first time a student is marked present for it —
// this fires the moment that happens, regardless of which flow triggered it
// (manual mark, self check-in, or the demo polling simulation). Once a
// student hits the 15-lesson cap they're done, so they're cleared off every
// slot they're still holding on the scheduling board.
function completeLessonFor(studentId: string) {
  const studentsStore = useStudentsStore.getState()
  const student = studentsStore.students.find((s) => s.id === studentId)
  if (!student) return

  const taken = (student.lessonsTaken ?? 0) + 1
  const done = taken >= MAX_LESSONS
  studentsStore.updateStudent(studentId, {
    lessonsTaken: taken,
    ...(done ? { status: 'completed' } : {}),
  })

  if (done) {
    useSchedulingStore.getState().removeStudentFromAllSlots(studentId)
  }
}

interface MarkOptions {
  driverName?:  string
  lessonsLeft?: number
  checkInTime?: string
  notes?:       string
}

interface WalkInInput {
  studentId:    string
  studentName:  string
  status:       AttendanceStatus
  driverName?:  string
  checkInTime?: string
  lessonsLeft:  number
  notes?:       string
}

interface AttendanceState {
  records: AttendanceRecord[]
  seededDate: string
  lastLiveUpdateAt: number | null
  mark: (id: string, status: AttendanceStatus, opts?: MarkOptions) => void
  updateLessonsLeft: (id: string, lessonsLeft: number) => void
  addWalkIn: (input: WalkInInput) => void
  autoMarkOverdue: () => void
  syncFromSchedule: () => void
  simulateSelfCheckIn: () => void
  findTodayRecordByStudentId: (studentId: string) => AttendanceRecord | undefined
  selfCheckIn: (studentId: string, studentName: string, lessonsLeft: number, driverName?: string) => string
}

// Persisted (unlike earlier in this app's history) so a check-in submitted
// from the public /check-in page — typically a separate tab or device —
// survives a reload of the secretary's Attendance page. See
// src/lib/crossTabSync.ts for how an already-open tab picks up writes made
// by another tab without needing a manual refresh.
const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
  records: INITIAL_ATTENDANCE,
  seededDate: todayIso(),
  lastLiveUpdateAt: null,

  mark: (id, status, opts = {}) => {
    const before = get().records.find((r) => r.id === id)
    set((state) => ({
      records: state.records.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          status,
          driverName:  opts.driverName ?? r.driverName,
          lessonsLeft: opts.lessonsLeft ?? r.lessonsLeft,
          checkInTime: opts.checkInTime ?? r.checkInTime ?? (status !== 'absent' ? nowLabel() : r.checkInTime),
          notes:       opts.notes ?? r.notes,
          source:      r.source ?? 'manual',
        }
      }),
    }))
    if (status === 'present' && before && before.status !== 'present') {
      completeLessonFor(before.studentId)
    }
  },

  updateLessonsLeft: (id, lessonsLeft) => set((state) => ({
    records: state.records.map((r) => (r.id === id ? { ...r, lessonsLeft } : r)),
  })),

  addWalkIn: (input) => {
    set((state) => ({
      records: [
        ...state.records,
        {
          id: `att-walkin-${Date.now()}`,
          studentId:   input.studentId,
          studentName: input.studentName,
          date:        todayIso(),
          hasSlot:     false,
          checkInTime: input.checkInTime ?? nowLabel(),
          source:      'manual' as const,
          driverName:  input.driverName,
          lessonsLeft: input.lessonsLeft,
          status:      input.status,
          notes:       input.notes,
        },
      ],
    }))
    if (input.status === 'present') completeLessonFor(input.studentId)
  },

  // Sweeps today's still-unmarked scheduled records and flips any that are
  // past the 60-minute no-show window to an auto-marked Absent.
  autoMarkOverdue: () => set((state) => ({
    records: state.records.map((r) => (
      isAutoAbsentDue(r) ? { ...r, status: 'absent', autoMarked: true } : r
    )),
  })),

  // Scheduling is the real source of truth for who's expected today, but
  // assigning a slot there doesn't itself create an attendance row — without
  // this, a student scheduled after the app's mock seed loaded (or on a day
  // the seed doesn't cover) would have no row to check into at all. Adds a
  // fresh unmarked row for any scheduled-today student who doesn't already
  // have one; never removes or overwrites an existing row.
  syncFromSchedule: () => set((state) => {
    const { grid } = useSchedulingStore.getState()
    const { students } = useStudentsStore.getState()
    const today = getTodayColumn()
    const date = todayIso()
    const known = new Set(state.records.filter((r) => r.date === date).map((r) => r.studentId))
    const additions: AttendanceRecord[] = []

    for (const hour of START_HOURS) {
      const assignments = grid[slotKey(today, hour)] ?? []
      for (const a of assignments) {
        if (known.has(a.studentId)) continue
        const student = students.find((s) => s.id === a.studentId)
        if (!student) continue
        additions.push({
          id: `att-sched-${a.studentId}-${hour}`,
          studentId: a.studentId,
          studentName: student.name,
          date,
          slotLabel: formatRangeShort(hour),
          hasSlot: true,
          lessonsLeft: remainingLessons(student),
        })
        known.add(a.studentId)
      }
    }

    return additions.length ? { records: [...state.records, ...additions] } : state
  }),

  // Demo-only stand-in for a real-time self check-in arriving via polling —
  // flips the next still-unmarked scheduled row to a self/present check-in.
  simulateSelfCheckIn: () => {
    const target = get().records.find((r) => r.hasSlot && !r.status)
    if (!target) return
    const driver = INSTRUCTORS[Math.floor(Math.random() * INSTRUCTORS.length)].name
    set((state) => ({
      lastLiveUpdateAt: Date.now(),
      records: state.records.map((r) =>
        r.id === target.id
          ? { ...r, status: 'present' as const, source: 'self' as const, checkInTime: nowLabel(), driverName: driver }
          : r,
      ),
    }))
    completeLessonFor(target.studentId)
  },

  findTodayRecordByStudentId: (studentId) =>
    get().records.find((r) => r.studentId === studentId && r.date === todayIso()),

  selfCheckIn: (studentId, studentName, lessonsLeft, driverName) => {
    // The public /check-in page runs outside AppShell, so it can't rely on
    // AppShell's periodic sweep having already turned a Scheduling
    // assignment into a row here — sync inline so a student scheduled
    // moments ago still resolves to their scheduled slot, not a walk-in.
    get().syncFromSchedule()
    const existing = get().findTodayRecordByStudentId(studentId)
    const wasPresent = existing?.status === 'present'

    if (existing) {
      set((state) => ({
        records: state.records.map((r) =>
          r.id === existing.id
            ? { ...r, status: 'present' as const, source: 'self' as const, checkInTime: r.checkInTime ?? nowLabel(), driverName: driverName ?? r.driverName }
            : r,
        ),
      }))
      if (!wasPresent) completeLessonFor(studentId)
      return existing.id
    }

    const id = `att-self-${Date.now()}`
    set((state) => ({
      records: [
        ...state.records,
        {
          id,
          studentId,
          studentName,
          date: todayIso(),
          hasSlot: false,
          checkInTime: nowLabel(),
          source: 'self' as const,
          driverName,
          lessonsLeft,
          status: 'present' as const,
        },
      ],
    }))
    completeLessonFor(studentId)
    return id
  },
    }),
    {
      name: 'qsp-attendance',
      // The mock seed is date-stamped to "today" at module load. Persisting
      // it verbatim would show yesterday's check-ins as if they were today's
      // on the next calendar day, so a stale seed is discarded on rehydrate —
      // same-day reloads/tabs keep their data, a new day starts fresh.
      merge: (persisted, current) => {
        const p = persisted as Partial<AttendanceState> | undefined
        if (!p || p.seededDate !== todayIso()) {
          return { ...current, records: INITIAL_ATTENDANCE, seededDate: todayIso(), lastLiveUpdateAt: null }
        }
        return { ...current, ...p }
      },
    },
  ),
)

export default useAttendanceStore
