export type AttendanceStatus = 'present' | 'absent' | 'late'
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
  notes?:        string
}

export interface Instructor {
  id:     string
  name:   string
  active: boolean
}
