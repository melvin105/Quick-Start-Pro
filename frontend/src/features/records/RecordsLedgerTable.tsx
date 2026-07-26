import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { formatGHS } from '../payments/utils'
import type { LedgerRow } from './types'

interface RecordsLedgerTableProps {
  rows:         LedgerRow[]
  editable:     boolean
  totalIncome:  number
  totalExpense: number
  onEdit:       (id: string) => void
  onDelete:     (id: string) => void
}

export default function RecordsLedgerTable({ rows, editable, totalIncome, totalExpense, onEdit, onDelete }: RecordsLedgerTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Time</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Description</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Income</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Expense</th>
              {editable && <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">{r.time}</td>
                <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{r.description}</td>
                <td className={`px-4 py-3 text-[13px] whitespace-nowrap ${r.type === 'income' ? 'text-brand-600 font-medium' : 'text-gray-600'}`}>
                  {r.category}
                </td>
                <td className="px-4 py-3 text-[13px] text-success font-medium whitespace-nowrap">
                  {r.type === 'income' ? formatGHS(r.amount) : ''}
                </td>
                <td className="px-4 py-3 text-[13px] text-danger font-medium whitespace-nowrap">
                  {r.type === 'expense' ? formatGHS(r.amount) : ''}
                </td>
                {editable && (
                  <td className="px-4 py-3 text-[12.5px] whitespace-nowrap">
                    {r.type === 'income' ? (
                      <span className="text-gray-300">—</span>
                    ) : confirmId === r.id ? (
                      <span className="flex items-center gap-2">
                        <span className="text-gray-500">Delete?</span>
                        <button type="button" onClick={() => { onDelete(r.id); setConfirmId(null) }} className="text-danger font-medium hover:underline">
                          Yes
                        </button>
                        <button type="button" onClick={() => setConfirmId(null)} className="text-gray-500 hover:underline">
                          No
                        </button>
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <button type="button" onClick={() => onEdit(r.id)} className="text-brand-600 hover:text-brand-700" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button type="button" onClick={() => setConfirmId(r.id)} className="text-danger hover:text-danger/80" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-[13px] font-semibold text-gray-900" colSpan={2}>Totals</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-success whitespace-nowrap">{formatGHS(totalIncome)}</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-danger whitespace-nowrap">{formatGHS(totalExpense)}</td>
                {editable && <td className="px-4 py-3" />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No records for this day yet.</div>
      )}
    </div>
  )
}
