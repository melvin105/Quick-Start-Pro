import { formatGHS } from '../payments/utils'
import type { LedgerRow } from './types'

interface RecordsLedgerCardListProps {
  rows: LedgerRow[]
}

export default function RecordsLedgerCardList({ rows }: RecordsLedgerCardListProps) {
  return (
    <div className="md:hidden flex flex-col gap-2 pb-4">
      {rows.map((r) => (
        <div
          key={r.id}
          className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-[13.5px] font-medium text-gray-900 truncate">{r.description}</p>
            <p className="text-[12px] text-gray-500 truncate">{r.time} · {r.category}</p>
          </div>
          <p className={`text-[14px] font-semibold shrink-0 ${r.type === 'income' ? 'text-success' : 'text-danger'}`}>
            {r.type === 'income' ? '+' : '-'}{formatGHS(r.amount)}
          </p>
        </div>
      ))}
      {rows.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No records for this day yet.
        </div>
      )}
    </div>
  )
}
