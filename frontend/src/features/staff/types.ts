export type StaffRole = 'secretary' | 'instructor'

export interface StaffMember {
  id:        string
  name:      string
  role:      StaffRole
  phone:     string
  email?:    string
  addedDate: string
}
