import type { ApiPaymentMethod, ApiPaymentRow } from './paymentService'
import type { PaymentMethod, PaymentRecord } from './types'

const METHOD_LABELS: Record<ApiPaymentMethod, PaymentMethod> = {
  cash:          'Cash',
  momo:          'MoMo',
  bank_transfer: 'Bank Transfer',
  cheque:        'Cheque',
}

const METHOD_VALUES: Record<PaymentMethod, ApiPaymentMethod> = {
  Cash:            'cash',
  MoMo:            'momo',
  'Bank Transfer': 'bank_transfer',
  Cheque:          'cheque',
}

export function paymentMethodLabel(method: ApiPaymentMethod): PaymentMethod {
  return METHOD_LABELS[method]
}

export function paymentMethodValue(method: PaymentMethod): ApiPaymentMethod {
  return METHOD_VALUES[method]
}

export function toPaymentRecord(row: ApiPaymentRow): PaymentRecord {
  return {
    id:             row.receipt_no,
    receiptId:      row.receipt_id,
    paymentId:      row.id,
    studentId:      row.student_id,
    studentNumber:  row.student_number,
    studentName:    row.student_name,
    programme:      row.package_name ?? undefined,
    amount:         row.amount,
    method:         paymentMethodLabel(row.method),
    date:           row.payment_date.slice(0, 10),
    time:           row.created_at ? new Date(row.created_at).toTimeString().slice(0, 5) : undefined,
    notes:          row.notes ?? undefined,
    recordedBy:     row.recorded_by_name ?? 'Quick Start Pro',
    packageFee:     row.package_fee,
    totalPaidAfter: row.total_paid,
    balanceAfter:   row.balance,
    status:         row.status,
  }
}
