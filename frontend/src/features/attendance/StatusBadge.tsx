import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { AttendanceStatus } from './types'

const CONFIG: Record<AttendanceStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  present: { label: 'Present', className: 'bg-success-bg text-success', Icon: CheckCircle2 },
  absent:  { label: 'Absent',  className: 'bg-danger-bg text-danger',   Icon: XCircle },
  late:    { label: 'Late',    className: 'bg-warning-bg text-warning', Icon: Clock },
}

export default function StatusBadge({ status }: { status: AttendanceStatus }) {
  const { label, className, Icon } = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  )
}
