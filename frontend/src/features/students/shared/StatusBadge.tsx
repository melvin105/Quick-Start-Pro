import type { StudentStatus } from './types'

const STYLES: Record<StudentStatus, string> = {
  active:      'bg-success-bg text-success',
  outstanding: 'bg-danger-bg text-danger',
  completed:   'bg-brand-50 text-brand-600',
}

const LABELS: Record<StudentStatus, string> = {
  active:      'Active',
  outstanding: 'Outstanding',
  completed:   'Completed',
}

export default function StatusBadge({ status }: { status: StudentStatus }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
