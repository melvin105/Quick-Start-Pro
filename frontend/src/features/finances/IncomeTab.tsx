import { formatGHS, formatDateDisplay } from '../payments/utils'
import type { FinanceIncomeEntry } from './financeService'

interface IncomeTabProps {
  rows: FinanceIncomeEntry[]
}

export default function IncomeTab({ rows }: IncomeTabProps) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {['Date', 'Student', 'Description', 'Amount'].map((col) => (
                <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{formatDateDisplay(r.date)}</td>
                <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{r.student_name}</td>
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.package_name ?? `${r.method.replace('_', ' ')} payment`}</td>
                <td className="px-4 py-3 text-[13px] text-success font-medium whitespace-nowrap">{formatGHS(r.amount)}</td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="px-4 py-3 text-[13px] font-semibold text-gray-900" colSpan={3}>Total Income</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-success whitespace-nowrap">{formatGHS(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No income recorded in this period.</div>
      )}
    </div>
  )
}
