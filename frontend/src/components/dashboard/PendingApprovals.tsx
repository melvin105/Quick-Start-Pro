export interface ApprovalItem {
  date: string
  text: string
}

interface PendingApprovalsProps {
  items: ApprovalItem[]
}

export default function PendingApprovals({ items }: PendingApprovalsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 h-full">
      <h2 className="text-[14.5px] font-semibold text-gray-900 mb-3">Pending Approvals ({items.length})</h2>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
            <div className="min-w-0">
              <p className="text-[11.5px] text-gray-500">{item.date}</p>
              <p className="text-[13px] text-gray-800 truncate">{item.text}</p>
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
    </div>
  )
}
