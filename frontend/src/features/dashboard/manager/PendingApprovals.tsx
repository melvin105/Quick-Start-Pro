import { Loader2 } from 'lucide-react'
import type { ApiError } from '../../../lib/apiError'

export interface ApprovalItem {
  id:     string
  name:   string
  detail: string
  date:   string
}

interface PendingApprovalsProps {
  items:    ApprovalItem[]
  loading?: boolean
  error?:   ApiError | null
  onRetry?: () => void
}

export default function PendingApprovals({ items, loading, error, onRetry }: PendingApprovalsProps) {
  const count = loading || error ? '' : ` (${items.length})`

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 h-full">
      <h2 className="text-[14.5px] font-semibold text-gray-900 mb-3">Pending Approvals{count}</h2>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-gray-500" role="status">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-[13px]">Loading…</span>
        </div>
      ) : error ? (
        <div className="py-4" role="alert">
          <p className="text-[13px] text-danger">{error.message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-[12px] font-medium text-brand-600 hover:text-brand-700"
            >
              Try again
            </button>
          )}
        </div>
      ) : items.length === 0 ? (
        <p className="text-[13px] text-gray-500 py-4">No pending approvals.</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-[11.5px] text-gray-500 truncate">{item.detail}{item.date ? ` · ${item.date}` : ''}</p>
              </div>
              <button
                type="button"
                className="shrink-0 text-[12px] font-medium text-brand-600 hover:text-brand-700 px-2.5 py-1 rounded-md hover:bg-brand-50 transition-colors"
              >
                Review
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
