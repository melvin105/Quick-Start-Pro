import useRecordsStore from '../records/shared/store'
import { formatGHS, formatDateDisplay } from '../payments/utils'
import { firstName } from './utils'
import type { StaffMember } from './types'

export default function SalaryHistoryTab({ staff }: { staff: StaffMember }) {
  const expenses = useRecordsStore((s) => s.expenses)
  const name = firstName(staff.name)
  const rows = expenses
    .filter((e) => e.description.includes(name))
    .sort((a, b) => b.date.localeCompare(a.date))
  const total = rows.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {['Date', 'Description', 'Amount'].map((col) => (
                <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{formatDateDisplay(e.date)}</td>
                <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{e.description}</td>
                <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{formatGHS(e.amount)}</td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="px-4 py-3 text-[13px] font-semibold text-gray-900" colSpan={2}>Total paid (all time)</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-gray-900 whitespace-nowrap">{formatGHS(total)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No salary payments recorded yet.</div>
      )}
    </div>
  )
}
