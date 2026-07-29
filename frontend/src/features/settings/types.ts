import type { Role } from '../../lib/constants'

export interface CoursePackage {
  id:      string
  name:    string
  lessons: number
  price:   number
  status:  'active' | 'inactive'
}

export interface UserAccount {
  id:     string
  name:   string
  email:  string
  role:   Role
  status: 'active' | 'locked'
  failedAttempts?:   number
  lastFailedAttempt?: string
}
