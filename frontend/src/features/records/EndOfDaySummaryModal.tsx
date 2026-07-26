import { formatGHS } from '../payments/utils'
import { formatDateWithWeekday, formatTimeAmPm, nowTime } from './utils'
import type { LedgerRow } from './types'

interface EndOfDaySummaryModalProps {
  date:            string
  openingBalance:  number
  incomeRows:      LedgerRow[]
  expenseRows:     LedgerRow[]
  totalIncome:     number
  totalExpense:    number
  closingBalance:  number
  preparedBy:      string
  onClose:         () => void
  onSubmit:        () => void
}

export default function EndOfDaySummaryModal({
  date, openingBalance, incomeRows, expenseRows, totalIncome, totalExpense, closingBalance, preparedBy, onClose, onSubmit,
}: EndOfDaySummaryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full max-h-[90vh] overflow-y-auto scrollbar-hide p-5">
        <h2 className="text-[15px] font-semibold text-gray-900">End of Day Summary</h2>
        <p className="text-[12px] text-gray-500 mb-4">{formatDateWithWeekday(date)}</p>

        <div className="flex justify-between text-[13px] py-2 border-b border-gray-100">
          <span className="text-gray-500">Opening Balance</span>
          <span className="font-medium text-gray-900">{formatGHS(openingBalance)}</span>
        </div>

        <div className="py-3 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Income ({incomeRows.length})</p>
          <div className="flex flex-col gap-1">
            {incomeRows.map((r) => (
              <div key={r.id} className="flex justify-between text-[13px]">
                <span className="text-gray-700 truncate pr-2">{r.description}</span>
                <span className="text-gray-900 shrink-0">{formatGHS(r.amount)}</span>
              </div>
            ))}
            {incomeRows.length === 0 && <p className="text-[12px] text-gray-400">No income recorded</p>}
          </div>
          <div className="flex justify-between text-[13px] font-semibold mt-2">
            <span className="text-success">Total Income</span>
            <span className="text-success">{formatGHS(totalIncome)}</span>
          </div>
        </div>

        <div className="py-3 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Expenses ({expenseRows.length})</p>
          <div className="flex flex-col gap-1">
            {expenseRows.map((r) => (
              <div key={r.id} className="flex justify-between text-[13px]">
                <span className="text-gray-700 truncate pr-2">{r.description}</span>
                <span className="text-gray-900 shrink-0">{formatGHS(r.amount)}</span>
              </div>
            ))}
            {expenseRows.length === 0 && <p className="text-[12px] text-gray-400">No expenses recorded</p>}
          </div>
          <div className="flex justify-between text-[13px] font-semibold mt-2">
            <span className="text-danger">Total Expenses</span>
            <span className="text-danger">{formatGHS(totalExpense)}</span>
          </div>
        </div>

        <div className="flex justify-between text-[14.5px] font-semibold py-3">
          <span className="text-gray-900">Closing Balance</span>
          <span className="text-gray-900">{formatGHS(closingBalance)}</span>
        </div>

        <p className="text-[11.5px] text-gray-400">Prepared by: {preparedBy} · Time: {formatTimeAmPm(nowTime())}</p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back and Edit
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            Submit to Manager
          </button>
        </div>
      </div>
    </div>
  )
}
