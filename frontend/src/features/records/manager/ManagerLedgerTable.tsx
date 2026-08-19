import { formatGHS } from '../../payments/utils'
import type { LedgerRow } from '../shared/types'

const COLUMNS = ['Time', 'Description', 'Category', 'Income', 'Expense']

export default function ManagerLedgerTable({ rows }: { rows: LedgerRow[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {COLUMNS.map((col) => (
                <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">{r.time}</td>
                <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{r.description}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.type === 'income' ? (
                    <span className="inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full bg-success-bg text-success whitespace-nowrap">
                      Income
                    </span>
                  ) : (
                    <span className="text-[13px] text-gray-600">{r.category}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[13px] text-success font-medium whitespace-nowrap">
                  {r.type === 'income' ? formatGHS(r.amount) : ''}
                </td>
                <td className="px-4 py-3 text-[13px] text-danger font-medium whitespace-nowrap">
                  {r.type === 'expense' ? formatGHS(r.amount) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No entries recorded for this day yet.</div>
      )}
    </div>
  )
}
