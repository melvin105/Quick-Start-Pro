import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PaymentMethod, PaymentRecord } from './types'
import { INITIAL_PAYMENTS } from './mockData'
import useStudentsStore from '../students/shared/store'

interface RecordPaymentInput {
  studentId:   string
  studentName: string
  programme?:  string
  amount:      number
  method:      PaymentMethod
  date:        string
  notes?:      string
  recordedBy:  string
  packageFee:  number
  currentBalance: number
}

interface PaymentsState {
  records: PaymentRecord[]
  nextReceiptNo: () => string
  recordPayment: (input: RecordPaymentInput) => PaymentRecord
}

// Persisted so a payment recorded moments ago still resolves when its
// receipt is opened in a new tab (Print Receipt uses target="_blank").
const usePaymentsStore = create<PaymentsState>()(
  persist(
    (set, get) => ({
      records: INITIAL_PAYMENTS,

      nextReceiptNo: () => {
        const numbers = get()
          .records.map((r) => parseInt(r.id.replace('R-', ''), 10))
          .filter((n) => !Number.isNaN(n))
        const next = (numbers.length ? Math.max(...numbers) : 0) + 1
        return `R-${String(next).padStart(4, '0')}`
      },

      recordPayment: (input) => {
        const balanceAfter = Math.max(input.currentBalance - input.amount, 0)
        const totalPaidAfter = input.packageFee - balanceAfter
        const record: PaymentRecord = {
          id: get().nextReceiptNo(),
          studentId: input.studentId,
          studentName: input.studentName,
          programme: input.programme,
          amount: input.amount,
          method: input.method,
          date: input.date,
          time: new Date().toTimeString().slice(0, 5),
          notes: input.notes,
          recordedBy: input.recordedBy,
          packageFee: input.packageFee,
          totalPaidAfter,
          balanceAfter,
          status: balanceAfter <= 0 ? 'paid' : 'partial',
        }
        set((state) => ({ records: [record, ...state.records] }))
        useStudentsStore.getState().updateStudent(input.studentId, { balance: balanceAfter })
        return record
      },
    }),
    { name: 'qsp-payments' },
  ),
)

export default usePaymentsStore
