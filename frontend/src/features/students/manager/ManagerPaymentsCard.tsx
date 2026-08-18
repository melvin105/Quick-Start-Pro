import { AlertTriangle } from 'lucide-react'
import type { Student } from '../shared/types'
import { formatGHS } from '../shared/utils'
import { formatDateDisplay } from '../../payments/utils'
import { getStudentPaymentHistory } from '../../payments/paymentService'
import { useApiResource } from '../../../lib/useApiResource'

interface ManagerPaymentsCardProps {
  student: Student
  onViewReceipts: () => void
}

export default function ManagerPaymentsCard({ student, onViewReceipts }: ManagerPaymentsCardProps) {
  const { data, loading, error } = useApiResource(() => getStudentPaymentHistory(student.id), [student.id])
  const packageFee = data?.summary.total_fees ?? student.packageFee ?? 0
  const totalPaid = data?.summary.total_paid ?? 0
  const balance = data?.summary.balance ?? student.balance
  const lastPayment = data?.payments[0]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Payments</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11.5px] text-gray-500">Package Fee</p>
          <p className="text-[14.5px] font-semibold text-gray-900">{formatGHS(packageFee)}</p>
        </div>
        <div>
          <p className="text-[11.5px] text-gray-500">Total Paid</p>
          <p className="text-[14.5px] font-semibold text-success">{formatGHS(totalPaid)}</p>
        </div>
      </div>

      {loading && <p className="text-[11.5px] text-gray-400">Refreshing payment summary…</p>}
      {error && <p className="text-[11.5px] text-danger">{error.message}</p>}

      {balance > 0 && (
        <div className="flex items-center gap-1.5 text-danger">
          <AlertTriangle size={14} />
          <p className="text-[13px] font-medium">Balance {formatGHS(balance)}</p>
        </div>
      )}

      {lastPayment && (
        <p className="text-[11.5px] text-gray-400">
          Last payment: {formatDateDisplay(lastPayment.payment_date)} ({formatGHS(lastPayment.amount)})
        </p>
      )}

      <button
        type="button"
        onClick={onViewReceipts}
        className="mt-1 text-[12px] font-medium text-brand-600 hover:text-brand-700 self-start"
      >
        View all receipts
      </button>
    </div>
  )
}
