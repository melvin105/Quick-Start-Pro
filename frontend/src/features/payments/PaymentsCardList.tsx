import StatusBadge from './StatusBadge'
import { formatGHS, formatDateDisplay } from './utils'
import type { PaymentRecord } from './types'

interface PaymentsCardListProps {
  records: PaymentRecord[]
  onView: (record: PaymentRecord) => void
}

export default function PaymentsCardList({ records, onView }: PaymentsCardListProps) {
  return (
    <div className="md:hidden flex flex-col gap-3 pb-16">
      {records.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onView(r)}
          className="text-left bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-gray-300 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-gray-900 truncate">{r.studentName}</p>
            <p className="text-[12px] text-gray-500 truncate">{r.id} · {r.method} · {formatDateDisplay(r.date)}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <p className="text-[14px] font-semibold text-gray-900">{formatGHS(r.amount)}</p>
            <StatusBadge status={r.status} />
          </div>
        </button>
      ))}
      {records.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No payment records match your filters.
        </div>
      )}
    </div>
  )
}
