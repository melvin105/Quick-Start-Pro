import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'
import type { ApiClosureStatus, ApiExpenseCategory } from '../records/shared/recordsService'

export interface FinanceDay {
  date:     string
  income:   number
  expenses: number
  net:      number
}

export interface FinanceIncomeEntry {
  id:           string
  date:         string
  created_at:   string
  amount:       number
  method:       string
  student_id:   string
  student_name: string
  package_name: string | null
}

export interface FinanceExpenseEntry {
  id:          string
  date:        string
  created_at:  string
  amount:      number
  description: string | null
  category:    ApiExpenseCategory
}

export interface FinanceClosure {
  closure_date:      string
  status:            ApiClosureStatus
  submitted_at:      string | null
  approved_at:       string | null
  remarks:           string | null
  submitted_by_name: string | null
  reviewed_by_name:  string | null
}

export interface FinanceResult {
  from:               string
  to:                 string
  income:             number
  expenses:           number
  net:                number
  outstandingBalance: number
  days:               FinanceDay[]
  incomeEntries:      FinanceIncomeEntry[]
  expenseEntries:     FinanceExpenseEntry[]
  closures:           FinanceClosure[]
}

export interface DriverStudentRow {
  studentId:       string
  studentName:     string
  lessonsInPeriod: number
  totalAllTime:    number
}

export interface DriverInstructorRow {
  instructorId:    string
  instructorName:  string
  lessonsInPeriod: number
  totalAllTime:    number
  avgPerWeek:      number
  students:        DriverStudentRow[]
}

export interface DriverReportResult {
  from:                 string
  to:                   string
  instructorId:         string | null
  totalLessonsInPeriod: number
  instructors:          DriverInstructorRow[]
}

export async function getFinances(from: string, to: string): Promise<FinanceResult> {
  try {
    const { data } = await api.get<FinanceResult>('/finances', { params: { from, to } })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getDriverReport(from: string, to: string, instructorId?: string): Promise<DriverReportResult> {
  try {
    const params = { from, to, ...(instructorId ? { instructorId } : {}) }
    const { data } = await api.get<DriverReportResult>('/reports/driver', { params })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
