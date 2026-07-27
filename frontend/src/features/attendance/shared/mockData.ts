import type { AttendanceRecord, Instructor } from './types'

export const INSTRUCTORS: Instructor[] = [
  { id: 'ins-1', name: 'Obed',    active: true },
  { id: 'ins-2', name: 'Patrick', active: true },
  { id: 'ins-3', name: 'Fred',    active: true },
]

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

// Seeded against the same six students from the Students module so phone
// look-up during self check-in resolves to a real record.
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1', studentId: 'QS-2025-001', studentName: 'John Mensah',
    date: todayIso(), slotLabel: '8-9am', hasSlot: true,
    checkInTime: '8:12am', source: 'self', driverName: 'Obed',
    lessonsLeft: 3, status: 'present',
  },
  {
    id: 'att-2', studentId: 'QS-2025-002', studentName: 'Mary Owusu',
    date: todayIso(), slotLabel: '8-9am', hasSlot: true,
    lessonsLeft: 8,
  },
  {
    id: 'att-3', studentId: 'QS-2025-003', studentName: 'Kwesi Boateng',
    date: todayIso(), slotLabel: '9-10am', hasSlot: true,
    checkInTime: '9:03am', source: 'self', driverName: 'Obed',
    lessonsLeft: 7, status: 'present',
  },
  {
    id: 'att-4', studentId: 'QS-2025-004', studentName: 'Ama Asante',
    date: todayIso(), slotLabel: '9-10am', hasSlot: true,
    checkInTime: '9:01am', source: 'manual', driverName: 'Patrick',
    lessonsLeft: 14, status: 'present',
  },
  {
    id: 'att-5', studentId: 'QS-2025-005', studentName: 'Yaw Darko',
    date: todayIso(), slotLabel: '10-11am', hasSlot: true,
    lessonsLeft: 5,
  },
  {
    id: 'att-6', studentId: 'QS-2025-006', studentName: 'Akwasi Asenso',
    date: todayIso(), hasSlot: false,
    checkInTime: '8:47am', source: 'self',
    lessonsLeft: 5,
  },
]

function daysAgoIso(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

// Past-dated records so the History page has something to filter — today's
// live records (from the store) are unioned with these at render time.
export const HISTORICAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'hist-1', studentId: 'QS-2025-001', studentName: 'John Mensah',
    date: daysAgoIso(1), slotLabel: '8-9am', hasSlot: true,
    checkInTime: '8:05am', source: 'self', driverName: 'Obed',
    lessonsLeft: 4, status: 'present',
  },
  {
    id: 'hist-2', studentId: 'QS-2025-002', studentName: 'Mary Owusu',
    date: daysAgoIso(1), slotLabel: '9-10am', hasSlot: true,
    checkInTime: '9:20am', source: 'manual', driverName: 'Patrick',
    lessonsLeft: 9, status: 'late',
  },
  {
    id: 'hist-3', studentId: 'QS-2025-003', studentName: 'Kwesi Boateng',
    date: daysAgoIso(2), slotLabel: '9-10am', hasSlot: true,
    lessonsLeft: 8, status: 'absent',
  },
  {
    id: 'hist-4', studentId: 'QS-2025-004', studentName: 'Ama Asante',
    date: daysAgoIso(2), slotLabel: '10-11am', hasSlot: true,
    checkInTime: '10:02am', source: 'self', driverName: 'Fred',
    lessonsLeft: 15, status: 'present',
  },
  {
    id: 'hist-5', studentId: 'QS-2025-005', studentName: 'Yaw Darko',
    date: daysAgoIso(3), slotLabel: '10-11am', hasSlot: true,
    checkInTime: '10:10am', source: 'manual', driverName: 'Obed',
    lessonsLeft: 6, status: 'present',
  },
  {
    id: 'hist-6', studentId: 'QS-2025-006', studentName: 'Akwasi Asenso',
    date: daysAgoIso(4), hasSlot: false,
    checkInTime: '2:15pm', source: 'self',
    lessonsLeft: 5, status: 'present',
  },
]
