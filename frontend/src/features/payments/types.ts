export type PaymentMethod = 'Cash' | 'MoMo'
export type PaymentStatus = 'paid' | 'partial'

export interface PaymentRecord {
  id:             string
  studentId:      string
  studentName:    string
  programme?:     string
  amount:         number
  method:         PaymentMethod
  date:           string
  notes?:         string
  recordedBy:     string
  packageFee:     number
  totalPaidAfter: number
  balanceAfter:   number
  status:         PaymentStatus
}
