export type Day = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'

export interface ScheduleStudent {
  id:        string
  name:      string
  enrolment: string
}

export interface SlotAssignment {
  studentId:        string
  lessonsRemaining: number
}
