import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus, AlertTriangle } from 'lucide-react'
import StatusBadge from '../shared/StatusBadge'
import SourceBadge from '../shared/SourceBadge'
import MarkDropdown from './MarkDropdown'
import { useAttendanceRow } from './useAttendanceRow'
import { getInitials } from '../shared/utils'
import type { AttendanceRecord } from '../shared/types'

function UnscheduledRow({ record }: { record: AttendanceRecord }) {
  const { handleMark } = useAttendanceRow(record)
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-warning-bg/40 border-b border-warning/10 last:border-0 flex-wrap">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-white text-warning border border-warning/30 flex items-center justify-center text-[11px] font-semibold shrink-0">
          {getInitials(record.studentName)}
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-gray-900 truncate">{record.studentName}</p>
          <p className="text-[11.5px] text-warning flex items-center gap-1">
            <AlertTriangle size={11} /> No slot today
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {record.checkInTime && (
          <div className="flex items-center gap-1.5 text-[12.5px] text-gray-600">
            <span>{record.checkInTime}</span>
            {record.source && <SourceBadge source={record.source} />}
          </div>
        )}
        {record.status ? <StatusBadge status={record.status} /> : <MarkDropdown onMark={handleMark} />}
      </div>
    </div>
  )
}

interface UnscheduledArrivalsProps {
  records: AttendanceRecord[]
  onAddWalkIn: () => void
}

export default function UnscheduledArrivals({ records, onAddWalkIn }: UnscheduledArrivalsProps) {
  const [open, setOpen] = useState(records.length > 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-4 py-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Unscheduled arrivals ({records.length} checked in, no slot today)
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {records.map((r) => <UnscheduledRow key={r.id} record={r} />)}
          {records.length === 0 && (
            <p className="px-4 py-6 text-center text-[12.5px] text-gray-400">No walk-ins yet today.</p>
          )}
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onAddWalkIn}
          className="flex items-center gap-1.5 text-[12.5px] font-medium text-brand-600 hover:text-brand-700"
        >
          <Plus size={13} /> Add Walk-In
        </button>
      </div>
    </div>
  )
}
