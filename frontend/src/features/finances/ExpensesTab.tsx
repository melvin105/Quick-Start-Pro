import useRecordsStore from '../records/shared/store'
import { formatGHS } from '../payments/utils'
import { formatDateDisplay } from '../payments/utils'
import type { PeriodRange } from './period'

interface ExpensesTabProps {
  range: PeriodRange
}

export default function ExpensesTab({ range }: ExpensesTabProps) {
  const expenses = useRecordsStore((s) => s.expenses)

  const rows = expenses
    .filter((e) => e.date >= range.from && e.date <= range.to)
    .sort((a, b) => b.date.localeCompare(a.date))

  const total = rows.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {['Date', 'Description', 'Category', 'Amount'].map((col) => (
                <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{formatDateDisplay(e.date)}</td>
                <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{e.description}</td>
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{e.category}</td>
                <td className="px-4 py-3 text-[13px] text-danger font-medium whitespace-nowrap">{formatGHS(e.amount)}</td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="px-4 py-3 text-[13px] font-semibold text-gray-900" colSpan={3}>Total Expenses</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-danger whitespace-nowrap">{formatGHS(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No expenses recorded in this period.</div>
      )}
    </div>
  )
}
