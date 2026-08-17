import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'

export type ApiPaymentMethod = 'cash' | 'momo' | 'bank_transfer' | 'cheque'
export type ApiPaymentStatus = 'paid' | 'partial'

export interface ApiPaymentRow {
  id:               string
  receipt_id:       string
  receipt_no:       string
  amount:           number
  method:           ApiPaymentMethod
  payment_date:     string
  notes:            string | null
  created_at:       string
  student_id:       string
  student_number:   string
  student_name:     string
  package_name:     string | null
  package_fee:      number
  total_paid:       number
  balance:          number
  recorded_by_name: string | null
  status:           ApiPaymentStatus
}

export interface ListPaymentsParams {
  studentId?: string
  method?:    ApiPaymentMethod
  status?:    ApiPaymentStatus
  dateFrom?:  string
  dateTo?:    string
  search?:    string
  page?:      number
  limit?:     number
}

export interface ListPaymentsResult {
  payments: ApiPaymentRow[]
  stats: {
    today_income:          number
    month_income:          number
    outstanding:           number
    students_with_balance: number
  }
  total:    number
  page:     number
  limit:    number
}

export interface RecordPaymentInput {
  studentId:    string
  amount:       number
  method:       ApiPaymentMethod
  paymentDate?: string
  notes?:       string
}

export interface RecordedPayment {
  id:           string
  student_id:   string
  amount:       number
  method:       ApiPaymentMethod
  payment_date: string
  notes:        string | null
  created_at:   string
  receipt_id:   string
  receipt_no:   string
  issued_at:    string
}

export interface ApiReceipt {
  id:               string
  receipt_no:       string
  issued_at:        string
  payment_id:       string
  amount:           number
  method:           ApiPaymentMethod
  payment_date:     string
  notes:            string | null
  student_id:       string
  student_number:   string
  student_name:     string
  package_name:     string | null
  package_fee:      number
  total_paid:       number
  balance:          number
  recorded_by_name: string | null
  school: {
    name:     string | null
    phone:    string | null
    address:  string | null
    currency: string | null
  }
}

export async function listPayments(params: ListPaymentsParams = {}): Promise<ListPaymentsResult> {
  try {
    const { data } = await api.get<ListPaymentsResult>('/payments', { params })
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function recordPayment(input: RecordPaymentInput): Promise<RecordedPayment> {
  try {
    const { data } = await api.post<RecordedPayment>('/payments', input)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}

export async function getReceipt(id: string): Promise<ApiReceipt> {
  try {
    const { data } = await api.get<ApiReceipt>(`/receipts/${id}`)
    return data
  } catch (err) {
    throw toApiError(err)
  }
}
