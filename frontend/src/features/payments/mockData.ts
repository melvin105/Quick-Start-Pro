import type { PaymentRecord } from './types'

// Dated across the last 7 days; each student's records sum to (packageFee -
// current balance) on their Student record, so the ledger reconciles.
// R-0043/R-0044 (today) fully close out Mary Owusu's and Ama Asante's
// balances — see the matching updates in students/mockData.ts.
export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'R-0035', studentId: 'QS-2025-001', studentName: 'John Mensah', programme: 'Driving and Licence',
    amount: 1500, method: 'Cash', date: '2026-07-20', time: '09:10', recordedBy: 'Mercy Osei',
    packageFee: 3200, totalPaidAfter: 1500, balanceAfter: 1700, status: 'partial',
  },
  {
    id: 'R-0036', studentId: 'QS-2025-003', studentName: 'Kwesi Boateng', programme: 'Manual — Standard (4 weeks)',
    amount: 2000, method: 'Cash', date: '2026-07-20', time: '11:45', recordedBy: 'Mercy Osei',
    packageFee: 2000, totalPaidAfter: 2000, balanceAfter: 0, status: 'paid',
  },
  {
    id: 'R-0037', studentId: 'QS-2025-002', studentName: 'Mary Owusu', programme: "Learner's Licence Processing",
    amount: 700, method: 'MoMo', date: '2026-07-21', time: '10:05', recordedBy: 'Mercy Osei',
    packageFee: 1200, totalPaidAfter: 700, balanceAfter: 500, status: 'partial',
  },
  {
    id: 'R-0038', studentId: 'QS-2025-005', studentName: 'Yaw Darko', programme: 'Automatic — Standard (4 weeks)',
    amount: 2000, method: 'Cash', date: '2026-07-22', time: '08:55', recordedBy: 'Mercy Osei',
    packageFee: 2000, totalPaidAfter: 2000, balanceAfter: 0, status: 'paid',
  },
  {
    id: 'R-0039', studentId: 'QS-2025-004', studentName: 'Ama Asante', programme: 'Automatic + Licence Package',
    amount: 2000, method: 'Cash', date: '2026-07-23', time: '13:20', recordedBy: 'Mercy Osei',
    packageFee: 3200, totalPaidAfter: 2000, balanceAfter: 1200, status: 'partial',
  },
  {
    id: 'R-0040', studentId: 'QS-2025-006', studentName: 'Akwasi Asenso', programme: 'Manual — Standard (4 weeks)',
    amount: 2000, method: 'MoMo', date: '2026-07-24', time: '09:30', recordedBy: 'Mercy Osei',
    packageFee: 2000, totalPaidAfter: 2000, balanceAfter: 0, status: 'paid',
  },
  {
    id: 'R-0041', studentId: 'QS-2025-004', studentName: 'Ama Asante', programme: 'Automatic + Licence Package',
    amount: 1050, method: 'Cash', date: '2026-07-25', time: '10:40', recordedBy: 'Mercy Osei',
    packageFee: 3200, totalPaidAfter: 3050, balanceAfter: 150, status: 'partial',
  },
  {
    id: 'R-0042', studentId: 'QS-2025-001', studentName: 'John Mensah', programme: 'Driving and Licence',
    amount: 1200, method: 'MoMo', date: '2026-07-26', time: '08:14', recordedBy: 'Mercy Osei',
    packageFee: 3200, totalPaidAfter: 2700, balanceAfter: 500, status: 'partial',
  },
  {
    id: 'R-0043', studentId: 'QS-2025-002', studentName: 'Mary Owusu', programme: "Learner's Licence Processing",
    amount: 500, method: 'Cash', date: '2026-07-26', time: '08:30', recordedBy: 'Mercy Osei',
    packageFee: 1200, totalPaidAfter: 1200, balanceAfter: 0, status: 'paid',
  },
  {
    id: 'R-0044', studentId: 'QS-2025-004', studentName: 'Ama Asante', programme: 'Automatic + Licence Package',
    amount: 150, method: 'Cash', date: '2026-07-26', time: '09:01', recordedBy: 'Mercy Osei',
    packageFee: 3200, totalPaidAfter: 3200, balanceAfter: 0, status: 'paid',
  },
]
