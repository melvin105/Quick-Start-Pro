export const EXPENSE_CATEGORIES = [
  'Salary',
  'Fuel',
  'Vehicle Maintenance',
  'Supplies & Stationery',
  'Rent & Utilities',
  'Other',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export type DayStatus = 'open' | 'submitted' | 'approved' | 'flagged'

export interface ExpenseEntry {
  id:          string
  date:        string
  time:        string
  description: string
  category:    ExpenseCategory
  amount:      number
  notes?:      string
}

export interface DayRecord {
  date:           string
  openingBalance: number
  status:         DayStatus
  submittedBy?:   string
  submittedAt?:   string
  reviewedBy?:    string
  reviewedAt?:    string
  flagNote?:      string
}

export interface LedgerRow {
  id:          string
  time:        string
  description: string
  category:    string
  type:        'income' | 'expense'
  amount:      number
}
