import type { DayRecord, ExpenseEntry } from './types'

// Past days line up with real payment dates in payments/mockData.ts (R-0040
// on 07-24, R-0041 on 07-25) so each day's income total is genuine, not
// fabricated. Today (07-26) is intentionally left out of INITIAL_DAYS — its
// opening balance is carried forward from 07-25's close via computeDay().
export const INITIAL_DAYS: DayRecord[] = [
  {
    date: '2026-07-24', openingBalance: 2200, status: 'approved',
    submittedBy: 'Mercy Osei', submittedAt: '2026-07-24T17:10:00',
    reviewedBy: 'John Mensah', reviewedAt: '2026-07-24T18:00:00',
  },
  {
    date: '2026-07-25', openingBalance: 3870, status: 'submitted',
    submittedBy: 'Mercy Osei', submittedAt: '2026-07-25T17:20:00',
  },
]

export const INITIAL_EXPENSES: ExpenseEntry[] = [
  {
    id: 'EX-0001', date: '2026-07-24', time: '09:30',
    description: 'Notebooks, receipt books', category: 'Supplies & Stationery', amount: 80,
  },
  {
    id: 'EX-0002', date: '2026-07-24', time: '10:15',
    description: 'Fuel for lesson vehicles', category: 'Fuel', amount: 250,
  },
  {
    id: 'EX-0003', date: '2026-07-25', time: '09:05',
    description: 'Printer paper, pens', category: 'Supplies & Stationery', amount: 60,
  },
  {
    id: 'EX-0004', date: '2026-07-25', time: '10:15',
    description: 'Fuel for lesson vehicles', category: 'Fuel', amount: 300,
  },
  {
    id: 'EX-0005', date: '2026-07-25', time: '11:00',
    description: 'Brake pad replacement', category: 'Vehicle Maintenance', amount: 150,
  },
  {
    id: 'EX-0006', date: '2026-07-26', time: '08:00',
    description: 'Instructor salary — Obed', category: 'Salary', amount: 600,
  },
  {
    id: 'EX-0007', date: '2026-07-26', time: '08:45',
    description: 'Notebooks, receipts, pen', category: 'Supplies & Stationery', amount: 45,
  },
  {
    id: 'EX-0008', date: '2026-07-26', time: '10:15',
    description: 'Fuel for lesson vehicles', category: 'Fuel', amount: 200,
  },
]
