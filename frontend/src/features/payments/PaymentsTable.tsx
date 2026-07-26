import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatGHS, formatDateDisplay, paymentReceiptPath } from './utils'
import type { PaymentRecord } from './types'

const COLUMNS = ['Receipt No.', 'Student', 'Amount', 'Method', 'Status', 'Date', 'Actions']

interface PaymentsTableProps {
  records: PaymentRecord[]
  onView: (record: PaymentRecord) => void
}

export default function PaymentsTable({ records, onView }: PaymentsTableProps) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
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
            {records.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                  <button type="button" onClick={() => onView(r)} className="font-medium text-brand-600 hover:text-brand-700">
                    {r.id}
                  </button>
                </td>
                <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{r.studentName}</td>
                <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{formatGHS(r.amount)}</td>
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.method}</td>
                <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{formatDateDisplay(r.date)}</td>
                <td className="px-4 py-3 text-[12.5px] whitespace-nowrap">
                  <button type="button" onClick={() => onView(r)} className="text-brand-600 hover:text-brand-700 font-medium">
                    View
                  </button>
                  {' | '}
                  <Link
                    to={paymentReceiptPath(r.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Print
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {records.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No payment records match your filters.</div>
      )}
    </div>
  )
}
