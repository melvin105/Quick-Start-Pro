import type { ApiDailyClosure, ApiExpense, ApiExpenseCategory, ApiLedgerRow } from './recordsService'
import type { DayRecord, DayStatus, ExpenseCategory, ExpenseEntry, LedgerRow } from './types'

const CATEGORY_LABELS: Record<ApiExpenseCategory, ExpenseCategory> = {
  fuel:                'Fuel',
  vehicle_maintenance: 'Vehicle Maintenance',
  salaries:            'Salary',
  rent:                'Rent',
  utilities:           'Utilities',
  dvla_fees:           'DVLA Fees',
  stationery:          'Supplies & Stationery',
  other:               'Other',
}

const CATEGORY_VALUES: Record<ExpenseCategory, ApiExpenseCategory> = {
  Fuel:                    'fuel',
  'Vehicle Maintenance':   'vehicle_maintenance',
  Salary:                  'salaries',
  Rent:                    'rent',
  Utilities:               'utilities',
  'DVLA Fees':             'dvla_fees',
  'Supplies & Stationery': 'stationery',
  'Rent & Utilities':      'utilities',
  Other:                   'other',
}

function timeLabel(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })
}

export function expenseCategoryLabel(value: ApiExpenseCategory): ExpenseCategory {
  return CATEGORY_LABELS[value]
}

export function expenseCategoryValue(value: ExpenseCategory): ApiExpenseCategory {
  return CATEGORY_VALUES[value]
}

export function toLedgerRow(row: ApiLedgerRow): LedgerRow {
  return {
    id:          row.entry_id,
    time:        timeLabel(row.entry_time),
    description: row.description,
    category:    row.category,
    type:        row.entry_type,
    amount:      row.entry_type === 'income' ? Number(row.income ?? 0) : Number(row.expense ?? 0),
  }
}

export function toExpenseEntry(row: ApiLedgerRow): ExpenseEntry | null {
  if (row.entry_type !== 'expense' || !row.source_category) return null
  return {
    id:          row.entry_id,
    date:        row.entry_date.slice(0, 10),
    time:        timeLabel(row.entry_time),
    description: row.description,
    category:    expenseCategoryLabel(row.source_category),
    amount:      Number(row.expense ?? 0),
  }
}

export function apiExpenseToEntry(expense: ApiExpense): ExpenseEntry {
  return {
    id:          expense.id,
    date:        expense.expense_date.slice(0, 10),
    time:        timeLabel(expense.created_at),
    description: expense.description ?? expenseCategoryLabel(expense.category),
    category:    expenseCategoryLabel(expense.category),
    amount:      expense.amount,
  }
}

function dayStatus(status: ApiDailyClosure['status']): DayStatus {
  if (status === 'pending_approval') return 'submitted'
  if (status === 'closed') return 'approved'
  return status
}

export function toDayRecord(closure: ApiDailyClosure): DayRecord {
  return {
    date:           closure.closure_date.slice(0, 10),
    openingBalance: closure.opening_balance,
    status:         dayStatus(closure.status),
    submittedBy:    closure.submitted_by_name ?? undefined,
    submittedAt:    closure.submitted_at ?? undefined,
    reviewedBy:     closure.reviewed_by_name ?? undefined,
    reviewedAt:     closure.approved_at ?? undefined,
    flagNote:       closure.remarks ?? undefined,
  }
}
