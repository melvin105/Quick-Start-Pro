export type AuditRole   = 'Manager' | 'Secretary' | 'Instructor'
export type AuditModule = 'Students' | 'Payments' | 'Attendance' | 'Finances' | 'Scheduling' | 'Staff' | 'Auth'
export type ActionType  = 'create' | 'edit' | 'approve' | 'flag' | 'login'

export interface AuditFieldChange {
  field: string
  value: string
}

export interface AuditDetail {
  record?:         string
  before?:         AuditFieldChange[]
  after?:          AuditFieldChange[]
  linkStudentId?:  string
  linkPaymentId?:  string
}

export interface AuditEntry {
  id:         string
  timestamp:  string
  user:       string
  role:       AuditRole
  action:     string
  actionType: ActionType
  module:     AuditModule
  flagged?:   boolean
  detail?:    AuditDetail
}
