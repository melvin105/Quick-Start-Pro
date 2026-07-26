import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import type { Student } from '../types'
import { formatGHS } from '../utils'
import { ROUTES } from '../../../lib/constants'
import usePaymentsStore from '../../payments/store'
import { formatDateDisplay } from '../../payments/utils'

interface PaymentsCardProps {
  student: Student
  onViewReceipts: () => void
}

export default function PaymentsCard({ student, onViewReceipts }: PaymentsCardProps) {
  const records = usePaymentsStore((s) => s.records)
  const packageFee = student.packageFee ?? 0
  const totalPaid = packageFee - student.balance
  const lastPayment = useMemo(
    () => records.filter((r) => r.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date))[0],
    [records, student.id],
  )

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

      {student.balance > 0 && (
        <div className="flex items-center gap-1.5 text-danger">
          <AlertTriangle size={14} />
          <p className="text-[13px] font-medium">Balance {formatGHS(student.balance)}</p>
        </div>
      )}

      {lastPayment && (
        <p className="text-[11.5px] text-gray-400">
          Last payment: {formatDateDisplay(lastPayment.date)} ({formatGHS(lastPayment.amount)})
        </p>
      )}

      <Link
        to={ROUTES.PAYMENTS}
        className="mt-1 text-center px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-[12.5px] font-medium rounded-lg transition-colors"
      >
        + Record Payment
      </Link>
      <button
        type="button"
        onClick={onViewReceipts}
        className="text-[12px] font-medium text-brand-600 hover:text-brand-700 self-center"
      >
        View all receipts
      </button>
    </div>
  )
}
