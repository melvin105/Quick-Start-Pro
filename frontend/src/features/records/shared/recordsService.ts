import api from '../../../lib/api'
import { toApiError } from '../../../lib/apiError'

export type ApiExpenseCategory =
  | 'fuel' | 'vehicle_maintenance' | 'salaries' | 'rent'
  | 'utilities' | 'dvla_fees' | 'stationery' | 'other'
export type ApiClosureStatus = 'open' | 'pending_approval' | 'closed' | 'flagged'

export interface ApiLedgerRow {
  entry_id:       string
  entry_type:     'income' | 'expense'
  entry_date:     string
  entry_time:     string
  description:    string
  category:       string
  source_category: ApiExpenseCategory | null
  income:         number | null
  expense:        number | null
}

export interface ApiDailyClosure {
  closure_date:      string
  opening_balance:   number
  total_income:      number
  total_expenses:    number
  closing_balance:   number
  status:            ApiClosureStatus
  submitted_by:      string | null
  submitted_at:      string | null
  approved_by:       string | null
  approved_at:       string | null
  remarks:           string | null
  submitted_by_name: string | null
  reviewed_by_name:  string | null
}

export interface DailyRecordsResult {
  date:    string
  ledger:  ApiLedgerRow[]
  closure: ApiDailyClosure
}

export interface ApiExpense {
  id:             string
  category:       ApiExpenseCategory
  amount:         number
  description:    string | null
  expense_date:   string
  vehicle_id:     string | null
  vehicle_reg_no: string | null
  created_by:     string
  created_at:     string
}

export interface ExpenseInput {
  category:     ApiExpenseCategory
  amount:       number
  description?: string
  expenseDate?: string
  vehicleId?:   string | null
}

export async function getDailyRecords(date: string): Promise<DailyRecordsResult> {
  try {
    const { data } = await api.get<DailyRecordsResult>('/records', { params: { date } })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function createExpense(input: ExpenseInput): Promise<ApiExpense> {
  try {
    const { data } = await api.post<ApiExpense>('/expenses', input)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>): Promise<ApiExpense> {
  try {
    const { data } = await api.patch<ApiExpense>(`/expenses/${id}`, input)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function deleteExpense(id: string): Promise<void> {
  try {
    await api.delete(`/expenses/${id}`)
  } catch (err) {
    throw toApiError(err)
  }
}

export async function submitEndOfDay(date: string): Promise<ApiDailyClosure> {
  try {
    const { data } = await api.post<ApiDailyClosure>('/end-of-day/submit', { date })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
