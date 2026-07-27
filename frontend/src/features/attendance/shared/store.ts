import { create } from 'zustand'
import type { AttendanceRecord, AttendanceStatus } from './types'
import { INITIAL_ATTENDANCE, INSTRUCTORS, todayIso } from './mockData'

function nowLabel() {
  return new Date()
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .toLowerCase()
    .replace(' ', '')
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
  lastLiveUpdateAt: number | null
  mark: (id: string, status: AttendanceStatus, opts?: MarkOptions) => void
  updateLessonsLeft: (id: string, lessonsLeft: number) => void
  addWalkIn: (input: WalkInInput) => void
  simulateSelfCheckIn: () => void
  findTodayRecordByStudentId: (studentId: string) => AttendanceRecord | undefined
  selfCheckIn: (studentId: string, studentName: string, lessonsLeft: number, driverName?: string) => string
}

const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: INITIAL_ATTENDANCE,
  lastLiveUpdateAt: null,

  mark: (id, status, opts = {}) => set((state) => ({
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
  })),

  updateLessonsLeft: (id, lessonsLeft) => set((state) => ({
    records: state.records.map((r) => (r.id === id ? { ...r, lessonsLeft } : r)),
  })),

  addWalkIn: (input) => set((state) => ({
    records: [
      ...state.records,
      {
        id: `att-walkin-${Date.now()}`,
        studentId:   input.studentId,
        studentName: input.studentName,
        date:        todayIso(),
        hasSlot:     false,
        checkInTime: input.checkInTime ?? nowLabel(),
        source:      'manual',
        driverName:  input.driverName,
        lessonsLeft: input.lessonsLeft,
        status:      input.status,
        notes:       input.notes,
      },
    ],
  })),

  // Demo-only stand-in for a real-time self check-in arriving via polling —
  // flips the next still-unmarked scheduled row to a self/present check-in.
  simulateSelfCheckIn: () => set((state) => {
    const target = state.records.find((r) => r.hasSlot && !r.status)
    if (!target) return state
    const driver = INSTRUCTORS[Math.floor(Math.random() * INSTRUCTORS.length)].name
    return {
      lastLiveUpdateAt: Date.now(),
      records: state.records.map((r) =>
        r.id === target.id
          ? { ...r, status: 'present', source: 'self', checkInTime: nowLabel(), driverName: driver }
          : r,
      ),
    }
  }),

  findTodayRecordByStudentId: (studentId) =>
    get().records.find((r) => r.studentId === studentId && r.date === todayIso()),

  selfCheckIn: (studentId, studentName, lessonsLeft, driverName) => {
    const existing = get().findTodayRecordByStudentId(studentId)
    if (existing) {
      set((state) => ({
        records: state.records.map((r) =>
          r.id === existing.id
            ? { ...r, status: 'present', source: 'self', checkInTime: r.checkInTime ?? nowLabel(), driverName: driverName ?? r.driverName }
            : r,
        ),
      }))
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
          source: 'self',
          driverName,
          lessonsLeft,
          status: 'present',
        },
      ],
    }))
    return id
  },
}))

export default useAttendanceStore
