import type { DayStatus } from '../shared/types'

const STYLES: Partial<Record<DayStatus, string>> = {
  submitted: 'bg-gray-100 text-gray-600',
  approved:  'bg-success-bg text-success',
  flagged:   'bg-warning-bg text-warning',
}

const LABELS: Partial<Record<DayStatus, string>> = {
  submitted: 'Submitted',
  approved:  'Approved',
  flagged:   'Flagged',
}

export default function DayStatusBadge({ status }: { status: DayStatus }) {
  if (status === 'open') return null
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
