import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check } from 'lucide-react'
import StatusBadge from './StatusBadge'
import SourceBadge from './SourceBadge'
import { getInitials } from './utils'
import { studentProfilePath } from '../../students/shared/utils'
import type { AttendanceRecord } from './types'

function Card({ record, onSendReminder }: { record: AttendanceRecord; onSendReminder: (record: AttendanceRecord) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[12px] font-semibold shrink-0">
          {getInitials(record.studentName)}
        </div>
        <div className="min-w-0 flex-1">
          <Link to={studentProfilePath(record.studentId)} className="text-[14px] font-medium text-gray-900 truncate block">
            {record.studentName}
          </Link>
          <p className="text-[12px] text-gray-500">{record.slotLabel ?? 'No slot'}</p>
        </div>
        <span className="text-[12px] text-gray-500 shrink-0">{record.lessonsLeft} left</span>
      </div>

      {record.checkInTime && (
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-600">
          <span>{record.checkInTime}</span>
          {record.source && <SourceBadge source={record.source} />}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {record.status ? (
          <StatusBadge status={record.status} autoMarked={record.autoMarked} />
        ) : (
          <span className="text-[12px] text-gray-400">Unmarked</span>
        )}
        {record.hasSlot && !record.status && (
          <button
            type="button"
            onClick={() => onSendReminder(record)}
            className="flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-brand-600 transition-colors"
          >
            <Bell size={12} /> Send Reminder
          </button>
        )}
      </div>
    </div>
  )
}

interface AttendanceCardListProps {
  records: AttendanceRecord[]
}

export default function AttendanceCardList({ records }: AttendanceCardListProps) {
  const [toast, setToast] = useState<string | null>(null)

  const handleSendReminder = (record: AttendanceRecord) => {
    setToast(`Reminder sent to ${record.studentName} — ${record.slotLabel ?? "today's class"}`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="md:hidden flex flex-col gap-3">
      {records.map((r) => <Card key={r.id} record={r} onSendReminder={handleSendReminder} />)}
      {records.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No students scheduled today.
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <Check size={15} className="text-success" />
          {toast}
        </div>
      )}
    </div>
  )
}
