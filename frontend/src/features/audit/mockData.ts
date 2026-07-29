import type { AuditEntry } from './types'

export const AUDIT_LOG: AuditEntry[] = [
  {
    id: 'aud-1', timestamp: '2026-07-25T11:00:00', user: 'Mercy Osei', role: 'Secretary',
    action: 'Edited payment R-0038', actionType: 'edit', module: 'Payments',
    detail: {
      record: 'Receipt R-0038 — Yaw Darko',
      before: [{ field: 'Amount', value: 'GHS 1,800.00' }],
      after:  [{ field: 'Amount', value: 'GHS 2,000.00' }],
      linkStudentId: 'QS-2025-005',
      linkPaymentId: 'R-0038',
    },
  },
  {
    id: 'aud-2', timestamp: '2026-07-25T09:38:00', user: 'Mercy Osei', role: 'Secretary',
    action: 'Recorded payment GHS 500', actionType: 'create', module: 'Payments',
    detail: { record: 'Receipt R-0043 — Mary Owusu', linkStudentId: 'QS-2025-002', linkPaymentId: 'R-0043' },
  },
  {
    id: 'aud-3', timestamp: '2026-07-25T09:15:00', user: 'Mercy Osei', role: 'Secretary',
    action: 'Registered student Akwasi Asenso', actionType: 'create', module: 'Students',
    detail: { record: 'QS-2025-006 — Akwasi Asenso', linkStudentId: 'QS-2025-006' },
  },
  {
    id: 'aud-4', timestamp: '2026-07-25T09:11:00', user: 'Mercy Osei', role: 'Secretary',
    action: 'Edited attendance status for Ama Asante', actionType: 'edit', module: 'Attendance',
    detail: { record: 'Attendance — Ama Asante, 25 Jul 2026', linkStudentId: 'QS-2025-004' },
  },
  {
    id: 'aud-5', timestamp: '2026-07-24T17:40:00', user: 'John Mensah', role: 'Manager',
    action: 'Approved & closed day', actionType: 'approve', module: 'Finances',
    detail: { record: 'Daily Records — 24 Jul 2026' },
  },
  {
    id: 'aud-6', timestamp: '2026-07-24T08:10:00', user: 'Mercy Osei', role: 'Secretary',
    action: '3 failed login attempts', actionType: 'login', module: 'Auth', flagged: true,
  },
  {
    id: 'aud-7', timestamp: '2026-07-23T16:05:00', user: 'John Mensah', role: 'Manager',
    action: 'Flagged day for correction', actionType: 'flag', module: 'Finances',
    detail: { record: 'Daily Records — 22 Jul 2026' },
  },
  {
    id: 'aud-8', timestamp: '2026-07-23T14:20:00', user: 'Mercy Osei', role: 'Secretary',
    action: 'Assigned Kwesi Boateng to a schedule slot', actionType: 'create', module: 'Scheduling',
    detail: { record: 'Wednesday · 9:00-10:00am', linkStudentId: 'QS-2025-003' },
  },
  {
    id: 'aud-9', timestamp: '2026-07-22T10:40:00', user: 'Mercy Osei', role: 'Secretary',
    action: 'Recorded payment GHS 1,050', actionType: 'create', module: 'Payments',
    detail: { record: 'Receipt R-0041 — Ama Asante', linkStudentId: 'QS-2025-004', linkPaymentId: 'R-0041' },
  },
  {
    id: 'aud-10', timestamp: '2026-07-21T18:00:00', user: 'John Mensah', role: 'Manager',
    action: 'Approved & closed day', actionType: 'approve', module: 'Finances',
    detail: { record: 'Daily Records — 21 Jul 2026' },
  },
  {
    id: 'aud-11', timestamp: '2026-07-20T15:10:00', user: 'John Mensah', role: 'Manager',
    action: 'Added staff member Fred Boateng', actionType: 'create', module: 'Staff',
    detail: { record: 'Fred Boateng — Driving Instructor' },
  },
  {
    id: 'aud-12', timestamp: '2026-07-20T09:10:00', user: 'Mercy Osei', role: 'Secretary',
    action: 'Edited student profile for John Mensah', actionType: 'edit', module: 'Students',
    detail: { record: 'QS-2025-001 — John Mensah', linkStudentId: 'QS-2025-001' },
  },
  {
    id: 'aud-13', timestamp: '2026-07-19T08:35:00', user: 'Kwadama Asare', role: 'Secretary',
    action: '3 failed login attempts', actionType: 'login', module: 'Auth', flagged: true,
  },
  {
    id: 'aud-14', timestamp: '2026-07-18T11:25:00', user: 'John Mensah', role: 'Manager',
    action: 'Approved & closed day', actionType: 'approve', module: 'Finances',
    detail: { record: 'Daily Records — 18 Jul 2026' },
  },
]
