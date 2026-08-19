export type StaffRole = 'secretary' | 'instructor'

export interface StaffMember {
  id:        string
  name:      string
  role:      StaffRole
  phone:     string
  email?:    string
  addedDate: string
  lessonsCount: number
  status: 'active' | 'inactive' | 'suspended'
}

export interface StaffLesson {
  id: string
  lessonDate: string
  startTime: string
  status: string
  studentId: string
  studentName: string
}
