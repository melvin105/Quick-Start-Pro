import { AlertTriangle } from 'lucide-react'
import { formatAuditTimestamp } from './utils'
import type { AuditEntry } from './types'

interface AuditLogCardListProps {
  entries: AuditEntry[]
  onSelect: (entry: AuditEntry) => void
}

export default function AuditLogCardList({ entries, onSelect }: AuditLogCardListProps) {
  return (
    <div className="md:hidden flex flex-col gap-3">
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onSelect(entry)}
          className={`text-left bg-white border rounded-2xl p-4 flex flex-col gap-1 transition-colors ${
            entry.flagged ? 'border-warning/30 bg-warning-bg/30' : 'border-gray-200'
          }`}
        >
          <p className={`text-[13.5px] font-medium flex items-center gap-1.5 ${entry.flagged ? 'text-warning' : 'text-gray-900'}`}>
            {entry.flagged && <AlertTriangle size={13} className="shrink-0" />}
            {entry.action}
          </p>
          <p className="text-[12px] text-gray-500">{entry.user} · {entry.role} · {formatAuditTimestamp(entry.timestamp)}</p>
        </button>
      ))}
      {entries.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No audit entries match your filters.
        </div>
      )}
    </div>
  )
}
