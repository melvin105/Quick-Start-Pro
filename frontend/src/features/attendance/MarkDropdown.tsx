import { useState } from 'react'
import { ChevronDown, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { AttendanceStatus } from './types'

interface MarkDropdownProps {
  onMark: (status: AttendanceStatus) => void
}

const OPTIONS: { status: AttendanceStatus; label: string; Icon: typeof CheckCircle2; className: string }[] = [
  { status: 'present', label: 'Present', Icon: CheckCircle2, className: 'text-success' },
  { status: 'absent',  label: 'Absent',  Icon: XCircle,      className: 'text-danger' },
  { status: 'late',    label: 'Late',    Icon: Clock,        className: 'text-warning' },
]

export default function MarkDropdown({ onMark }: MarkDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 px-2.5 py-1.5 text-[12.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
      >
        Mark
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-card overflow-hidden">
            {OPTIONS.map(({ status, label, Icon, className }) => (
              <button
                key={status}
                type="button"
                onClick={() => { onMark(status); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Icon size={14} className={className} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
