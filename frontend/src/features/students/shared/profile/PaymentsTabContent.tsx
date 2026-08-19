import type { Student } from '../types'
import { formatGHS } from '../utils'
import { formatDateDisplay } from '../../../payments/utils'
import { paymentMethodLabel } from '../../../payments/paymentMappers'
import { getStudentPaymentHistory } from '../../../payments/paymentService'
import { useApiResource } from '../../../../lib/useApiResource'
import LoadingState from '../../../../components/ui/LoadingState'
import ErrorState from '../../../../components/ui/ErrorState'

export default function PaymentsTabContent({ student }: { student: Student }) {
  const { data, loading, error, refetch } = useApiResource(() => getStudentPaymentHistory(student.id), [student.id])

  if (loading) return <LoadingState message="Loading payment history…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const packageFee = data?.summary.total_fees ?? student.packageFee ?? 0
  const totalPaid = data?.summary.total_paid ?? 0
  const balance = data?.summary.balance ?? student.balance
  const payments = data?.payments ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[11.5px] text-gray-500">Package Fee</p>
          <p className="text-[14.5px] font-semibold text-gray-900">{formatGHS(packageFee)}</p>
        </div>
        <div>
          <p className="text-[11.5px] text-gray-500">Total Paid</p>
          <p className="text-[14.5px] font-semibold text-success">{formatGHS(totalPaid)}</p>
        </div>
        <div>
          <p className="text-[11.5px] text-gray-500">Remaining</p>
          <p className={`text-[14.5px] font-semibold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
            {formatGHS(balance)}
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No payments recorded yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Receipt', 'Date', 'Amount', 'Method', 'Bal. After'].map((col) => (
                    <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-[13px] font-medium text-gray-900 whitespace-nowrap">{p.receipt_no}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{formatDateDisplay(p.payment_date)}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{formatGHS(p.amount)}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{paymentMethodLabel(p.method)}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{formatGHS(p.balance_after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
