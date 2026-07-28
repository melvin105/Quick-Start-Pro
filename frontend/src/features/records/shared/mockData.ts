import type { DayRecord, ExpenseEntry } from './types'

// Days line up with real payment dates in payments/mockData.ts (07-20
// through 07-26) so each day's income total is genuine, not fabricated.
// One day (07-22) is seeded as 'flagged' and one (07-25) as 'submitted'
// (pending) so the manager Records/Finances views have every status to
// show. 07-27 onward is intentionally left unrecorded — the secretary
// hasn't submitted those days yet; their opening balance carries forward
// from 07-26's close via computeDay().
export const INITIAL_DAYS: DayRecord[] = [
  {
    date: '2026-07-20', openingBalance: 1500, status: 'approved',
    submittedBy: 'Mercy Osei', submittedAt: '2026-07-20T17:15:00',
    reviewedBy: 'John Mensah', reviewedAt: '2026-07-20T18:00:00',
  },
  {
    date: '2026-07-21', openingBalance: 4220, status: 'approved',
    submittedBy: 'Mercy Osei', submittedAt: '2026-07-21T17:15:00',
    reviewedBy: 'John Mensah', reviewedAt: '2026-07-21T18:00:00',
  },
  {
    date: '2026-07-22', openingBalance: 4870, status: 'flagged',
    submittedBy: 'Mercy Osei', submittedAt: '2026-07-22T17:15:00',
    reviewedBy: 'John Mensah', reviewedAt: '2026-07-22T18:05:00',
    flagNote: 'Vehicle maintenance receipt missing — please confirm the amount.',
  },
  {
    date: '2026-07-23', openingBalance: 6550, status: 'approved',
    submittedBy: 'Mercy Osei', submittedAt: '2026-07-23T17:10:00',
    reviewedBy: 'John Mensah', reviewedAt: '2026-07-23T18:00:00',
  },
  {
    date: '2026-07-24', openingBalance: 7950, status: 'approved',
    submittedBy: 'Mercy Osei', submittedAt: '2026-07-24T17:10:00',
    reviewedBy: 'John Mensah', reviewedAt: '2026-07-24T18:00:00',
  },
  {
    date: '2026-07-25', openingBalance: 9620, status: 'submitted',
    submittedBy: 'Mercy Osei', submittedAt: '2026-07-25T17:20:00',
  },
  {
    date: '2026-07-26', openingBalance: 10160, status: 'approved',
    submittedBy: 'Mercy Osei', submittedAt: '2026-07-26T17:20:00',
    reviewedBy: 'John Mensah', reviewedAt: '2026-07-26T18:10:00',
  },
]

export const INITIAL_EXPENSES: ExpenseEntry[] = [
  {
    id: 'EX-0001', date: '2026-07-20', time: '08:00',
    description: 'Instructor salary — Patrick', category: 'Salary', amount: 600,
  },
  {
    id: 'EX-0002', date: '2026-07-20', time: '10:30',
    description: 'Fuel for lesson vehicles', category: 'Fuel', amount: 180,
  },
  {
    id: 'EX-0003', date: '2026-07-21', time: '09:15',
    description: 'Printer paper, pens', category: 'Supplies & Stationery', amount: 50,
  },
  {
    id: 'EX-0004', date: '2026-07-22', time: '10:00',
    description: 'Fuel for lesson vehicles', category: 'Fuel', amount: 200,
  },
  {
    id: 'EX-0005', date: '2026-07-22', time: '14:30',
    description: 'Brake pad replacement', category: 'Vehicle Maintenance', amount: 120,
  },
  {
    id: 'EX-0006', date: '2026-07-23', time: '08:00',
    description: 'Instructor salary — Fred', category: 'Salary', amount: 600,
  },
  {
    id: 'EX-0007', date: '2026-07-24', time: '09:30',
    description: 'Notebooks, receipt books', category: 'Supplies & Stationery', amount: 80,
  },
  {
    id: 'EX-0008', date: '2026-07-24', time: '10:15',
    description: 'Fuel for lesson vehicles', category: 'Fuel', amount: 250,
  },
  {
    id: 'EX-0009', date: '2026-07-25', time: '09:05',
    description: 'Printer paper, pens', category: 'Supplies & Stationery', amount: 60,
  },
  {
    id: 'EX-0010', date: '2026-07-25', time: '10:15',
    description: 'Fuel for lesson vehicles', category: 'Fuel', amount: 300,
  },
  {
    id: 'EX-0011', date: '2026-07-25', time: '11:00',
    description: 'Brake pad replacement', category: 'Vehicle Maintenance', amount: 150,
  },
  {
    id: 'EX-0012', date: '2026-07-26', time: '08:00',
    description: 'Instructor salary — Obed', category: 'Salary', amount: 600,
  },
  {
    id: 'EX-0013', date: '2026-07-26', time: '08:45',
    description: 'Notebooks, receipts, pen', category: 'Supplies & Stationery', amount: 45,
  },
  {
    id: 'EX-0014', date: '2026-07-26', time: '10:15',
    description: 'Fuel for lesson vehicles', category: 'Fuel', amount: 200,
  },
]
