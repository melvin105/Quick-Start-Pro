import { AlertTriangle } from 'lucide-react'
import { formatAuditTimestamp } from './utils'
import type { AuditEntry } from './types'

const COLUMNS = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Result']

function resultFor(entry: AuditEntry) {
  if (entry.actionType === 'login' && entry.flagged) return { label: 'Failed', className: 'bg-danger-bg text-danger' }
  if (entry.flagged) return { label: 'Flagged', className: 'bg-warning-bg text-warning' }
  return { label: 'Success', className: 'bg-success-bg text-success' }
}

interface AuditLogTableProps {
  entries: AuditEntry[]
  onSelect: (entry: AuditEntry) => void
}

export default function AuditLogTable({ entries, onSelect }: AuditLogTableProps) {
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
            {entries.map((entry) => {
              const result = resultFor(entry)
              return (
                <tr
                  key={entry.id}
                  onClick={() => onSelect(entry)}
                  className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                    entry.flagged ? 'bg-warning-bg/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{formatAuditTimestamp(entry.timestamp)}</td>
                  <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{entry.user}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{entry.role}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      {entry.flagged && <AlertTriangle size={12} className="text-warning shrink-0" />}
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{entry.module}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${result.className}`}>
                      {result.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {entries.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No audit entries match your filters.</div>
      )}
    </div>
  )
}
