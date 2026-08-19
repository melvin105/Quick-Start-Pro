import { CheckCircle2, XCircle, Clock, MinusCircle } from 'lucide-react'
import type { AttendanceStatus } from './types'

const CONFIG: Record<AttendanceStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  present: { label: 'Present', className: 'bg-success-bg text-success', Icon: CheckCircle2 },
  absent:  { label: 'Absent',  className: 'bg-danger-bg text-danger',   Icon: XCircle },
  late:    { label: 'Late',    className: 'bg-warning-bg text-warning', Icon: Clock },
  excused: { label: 'Excused', className: 'bg-gray-100 text-gray-600', Icon: MinusCircle },
}

interface StatusBadgeProps {
  status:      AttendanceStatus
  autoMarked?: boolean
}

export default function StatusBadge({ status, autoMarked }: StatusBadgeProps) {
  if (status === 'absent' && autoMarked) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap bg-gray-100 text-gray-600">
        <Clock size={12} />
        Auto-marked absent
      </span>
    )
  }

  const { label, className, Icon } = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  )
}
