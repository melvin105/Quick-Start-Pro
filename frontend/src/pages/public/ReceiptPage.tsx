import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Printer, FileDown, X, MessageSquare, Check } from 'lucide-react'
import { getReceipt } from '../../features/payments/paymentService'
import { paymentMethodLabel } from '../../features/payments/paymentMappers'
import { formatGHS, formatDateLong, shareReceiptViaSms, DEFAULT_SCHOOL_NAME } from '../../features/payments/utils'
import { useApiResource } from '../../lib/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

export default function ReceiptPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: receipt, loading, error, refetch } = useApiResource(() => getReceipt(id), [id])
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!receipt) return
    const timer = setTimeout(() => window.print(), 400)
    return () => clearTimeout(timer)
  }, [receipt])

  const handleShare = async () => {
    if (!receipt) return
    const result = await shareReceiptViaSms(
      receipt.student_name,
      receipt.amount,
      receipt.school.name ?? DEFAULT_SCHOOL_NAME,
      id,
    )
    if (result === 'copied') {
      setToast('Link copied — SMS only works from a phone')
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (loading) return <LoadingState message="Loading receipt…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!receipt) return null

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-6 print:bg-white print:p-0">
      <div className="print-area w-full max-w-sm bg-white rounded-2xl shadow-card print:shadow-none print:rounded-none p-6 flex flex-col gap-4">
        <div className="text-center border-b border-gray-200 pb-3">
          <p className="text-[15px] font-bold text-gray-900 uppercase tracking-wide">
            {receipt.school.name ?? 'Quick Start Driving School'}
          </p>
          <p className="text-[11.5px] text-gray-500 mt-0.5">{receipt.school.address ?? 'Spintex Road, Accra'}</p>
          {receipt.school.phone && <p className="text-[11.5px] text-gray-500">{receipt.school.phone}</p>}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[12px] text-gray-500">Date: {formatDateLong(receipt.payment_date)}</p>
          <p className="text-[13.5px] font-bold text-gray-900">RECEIPT {receipt.receipt_no}</p>
        </div>

        <div className="flex flex-col gap-1 text-[13px]">
          <div className="flex justify-between"><span className="text-gray-500">Student</span><span className="text-gray-900 font-medium">{receipt.student_name}</span></div>
          {receipt.package_name && (
            <div className="flex justify-between"><span className="text-gray-500">Programme</span><span className="text-gray-900">{receipt.package_name}</span></div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-3 flex flex-col gap-1 text-[13px]">
          <div className="flex justify-between"><span className="text-gray-500">Amount Paid</span><span className="text-gray-900 font-semibold">{formatGHS(receipt.amount)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="text-gray-900">{paymentMethodLabel(receipt.method)}</span></div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex flex-col gap-1 text-[13px]">
          <div className="flex justify-between"><span className="text-gray-500">Package Fee</span><span className="text-gray-900">{formatGHS(receipt.package_fee)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Total Paid</span><span className="text-gray-900">{formatGHS(receipt.total_paid)}</span></div>
          <div className="flex justify-between font-semibold">
            <span className={receipt.balance > 0 ? 'text-warning' : 'text-success'}>Balance</span>
            <span className={receipt.balance > 0 ? 'text-warning' : 'text-success'}>{formatGHS(receipt.balance)}</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">Recorded by: {receipt.recorded_by_name ?? 'Quick Start Pro'}</p>
        <p className="text-[11px] font-semibold text-danger text-center">NOTE: MONEY PAID IS NOT REFUNDABLE</p>

        <div className="flex gap-2 pt-2 print:hidden">
          <button type="button" onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium rounded-lg transition-colors"><Printer size={15} /> Print</button>
          <button type="button" onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium rounded-lg transition-colors"><FileDown size={15} /> Download PDF</button>
          <button type="button" onClick={() => void handleShare()} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-medium rounded-lg transition-colors whitespace-nowrap"><MessageSquare size={15} /> SMS</button>
          <button type="button" onClick={() => window.close()} className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-medium rounded-lg transition-colors" aria-label="Close"><X size={15} /></button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal print:hidden">
          <Check size={15} className="text-success" />{toast}
        </div>
      )}
    </div>
  )
}
