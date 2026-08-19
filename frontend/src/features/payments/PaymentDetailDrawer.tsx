import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Printer, Link2, Check } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatGHS, formatDateDisplay, paymentReceiptPath, shareReceipt } from './utils'
import type { PaymentRecord } from './types'

interface PaymentDetailDrawerProps {
  record: PaymentRecord
  onClose: () => void
}

export default function PaymentDetailDrawer({ record, onClose }: PaymentDetailDrawerProps) {
  const [toast, setToast] = useState<string | null>(null)

  const handleShare = async () => {
    const result = await shareReceipt(record.receiptId ?? record.id)
    if (result === 'copied') {
      setToast('Link copied')
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-white shadow-modal flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200 shrink-0">
          <h2 className="text-[15px] font-semibold text-gray-900">{record.id}</h2>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div>
            <p className="text-[13.5px] font-medium text-gray-900">{record.studentName}</p>
            {record.programme && <p className="text-[12px] text-gray-500">{record.programme}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11.5px] text-gray-500">Amount Paid</p>
              <p className="text-[15px] font-semibold text-gray-900">{formatGHS(record.amount)}</p>
            </div>
            <div>
              <p className="text-[11.5px] text-gray-500">Method</p>
              <p className="text-[15px] font-semibold text-gray-900">{record.method}</p>
            </div>
            <div>
              <p className="text-[11.5px] text-gray-500">Date</p>
              <p className="text-[13.5px] text-gray-900">{formatDateDisplay(record.date)}</p>
            </div>
            <div>
              <p className="text-[11.5px] text-gray-500 mb-1">Status</p>
              <StatusBadge status={record.status} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Balance Summary</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Package Fee</span>
                <span className="text-gray-900 font-medium">{formatGHS(record.packageFee)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Total Paid</span>
                <span className="text-success font-medium">{formatGHS(record.totalPaidAfter)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Balance</span>
                <span className={`font-medium ${record.balanceAfter > 0 ? 'text-danger' : 'text-success'}`}>
                  {formatGHS(record.balanceAfter)}
                </span>
              </div>
            </div>
          </div>

          {record.notes && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-[13px] text-gray-700">{record.notes}</p>
            </div>
          )}

          <p className="text-[11.5px] text-gray-400">Recorded by {record.recordedBy}</p>
        </div>

        <div className="p-5 border-t border-gray-200 shrink-0 flex gap-2">
          <Link
            to={paymentReceiptPath(record.receiptId ?? record.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Printer size={15} /> Print
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-medium rounded-lg transition-colors"
          >
            <Link2 size={15} /> Share Receipt
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <Check size={15} className="text-success" />
          {toast}
        </div>
      )}
    </div>
  )
}
