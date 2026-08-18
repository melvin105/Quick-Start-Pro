export type PaymentMethod = 'Cash' | 'MoMo' | 'Bank Transfer' | 'Cheque'
export type PaymentStatus = 'paid' | 'partial'

export interface PaymentRecord {
  id:             string
  receiptId?:     string
  paymentId?:     string
  studentId:      string
  studentNumber?: string
  studentName:    string
  programme?:     string
  amount:         number
  method:         PaymentMethod
  date:           string
  time?:          string
  notes?:         string
  recordedBy:     string
  packageFee:     number
  totalPaidAfter: number
  balanceAfter:   number
  status:         PaymentStatus
}
