import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Printer, FileDown, X } from 'lucide-react'
import usePaymentsStore from '../../features/payments/store'
import { formatGHS, formatDateLong } from '../../features/payments/utils'
import { ROUTES } from '../../lib/constants'

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const record = usePaymentsStore((s) => s.records.find((r) => r.id === id))

  useEffect(() => {
    if (!record) return
    const t = setTimeout(() => window.print(), 400)
    return () => clearTimeout(t)
  }, [record])

  if (!record) {
    return <Navigate to={ROUTES.PAYMENTS} replace />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-6 print:bg-white print:p-0">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card print:shadow-none print:rounded-none p-6 flex flex-col gap-4">
        <div className="text-center border-b border-gray-200 pb-3">
          <p className="text-[15px] font-bold text-gray-900 uppercase tracking-wide">Quick Start Driving School</p>
          <p className="text-[11.5px] text-gray-500 mt-0.5">Ayeduase Gate, Kumasi</p>
          <p className="text-[11.5px] text-gray-500">024 500 0075 / 024 382 0282</p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[12px] text-gray-500">Date: {formatDateLong(record.date)}</p>
          <p className="text-[13.5px] font-bold text-gray-900">RECEIPT {record.id}</p>
        </div>

        <div className="flex flex-col gap-1 text-[13px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Student</span>
            <span className="text-gray-900 font-medium">{record.studentName}</span>
          </div>
          {record.programme && (
            <div className="flex justify-between">
              <span className="text-gray-500">Programme</span>
              <span className="text-gray-900">{record.programme}</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-3 flex flex-col gap-1 text-[13px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Amount Paid</span>
            <span className="text-gray-900 font-semibold">{formatGHS(record.amount)}.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Method</span>
            <span className="text-gray-900">{record.method}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex flex-col gap-1 text-[13px]">
          <div className="flex justify-between">
            <span className="text-gray-500">Package Fee</span>
            <span className="text-gray-900">{formatGHS(record.packageFee)}.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Paid</span>
            <span className="text-gray-900">{formatGHS(record.totalPaidAfter)}.00</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className={record.balanceAfter > 0 ? 'text-warning' : 'text-success'}>Balance</span>
            <span className={record.balanceAfter > 0 ? 'text-warning' : 'text-success'}>
              {formatGHS(record.balanceAfter)}.00
            </span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">Recorded by: {record.recordedBy}</p>
        <p className="text-[11px] font-semibold text-danger text-center">NOTE: MONEY PAID IS NOT REFUNDABLE</p>

        <div className="flex gap-2 pt-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Printer size={15} /> Print
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium rounded-lg transition-colors"
          >
            <FileDown size={15} /> Download PDF
          </button>
          <button
            type="button"
            onClick={() => window.close()}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-medium rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
