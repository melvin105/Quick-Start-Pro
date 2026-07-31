export type AttendanceStatus = 'present' | 'absent'
export type CheckInSource = 'self' | 'manual'

export interface AttendanceRecord {
  id:            string
  studentId:     string
  studentName:   string
  date:          string
  slotLabel?:    string
  hasSlot:       boolean
  checkInTime?:  string
  source?:       CheckInSource
  driverName?:   string
  lessonsLeft:   number
  status?:       AttendanceStatus
  // True when the 60-minute no-show rule marked this Absent automatically,
  // rather than a secretary/manager doing it via Mark Manually.
  autoMarked?:   boolean
  notes?:        string
}

export interface Instructor {
  id:     string
  name:   string
  active: boolean
}
