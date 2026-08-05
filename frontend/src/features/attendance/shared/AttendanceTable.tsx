import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check } from 'lucide-react'
import StatusBadge from './StatusBadge'
import SourceBadge from './SourceBadge'
import { getInitials } from './utils'
import { studentProfilePath } from '../../students/shared/utils'
import type { AttendanceRecord } from './types'

const COLUMNS = ['Student', 'Slot', 'Check-in Time', 'Driver', 'Lessons Left', 'Status', 'Actions']

function Row({ record, onSendReminder }: { record: AttendanceRecord; onSendReminder: (record: AttendanceRecord) => void }) {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[11px] font-semibold shrink-0">
            {getInitials(record.studentName)}
          </div>
          <Link
            to={studentProfilePath(record.studentId)}
            className="text-[13.5px] font-medium text-gray-900 hover:text-brand-600 whitespace-nowrap transition-colors"
          >
            {record.studentName}
          </Link>
        </div>
      </td>
      <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{record.slotLabel ?? '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {record.checkInTime ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-gray-900">{record.checkInTime}</span>
            {record.source && <SourceBadge source={record.source} />}
          </div>
        ) : (
          <span className="text-[13px] text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{record.driverName ?? '—'}</td>
      <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{record.lessonsLeft} left</td>
      <td className="px-4 py-3">
        {record.status ? (
          <StatusBadge status={record.status} autoMarked={record.autoMarked} />
        ) : (
          <span className="text-[12px] text-gray-400">Unmarked</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {record.hasSlot && !record.status && (
          <button
            type="button"
            onClick={() => onSendReminder(record)}
            className="flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-brand-600 transition-colors"
          >
            <Bell size={12} /> Send Reminder
          </button>
        )}
      </td>
    </tr>
  )
}

interface AttendanceTableProps {
  records: AttendanceRecord[]
}

export default function AttendanceTable({ records }: AttendanceTableProps) {
  const [toast, setToast] = useState<string | null>(null)

  const handleSendReminder = (record: AttendanceRecord) => {
    setToast(`Reminder sent to ${record.studentName} — ${record.slotLabel ?? "today's class"}`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {COLUMNS.map((col) => (
                <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => <Row key={r.id} record={r} onSendReminder={handleSendReminder} />)}
          </tbody>
        </table>
      </div>
      {records.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No students scheduled today.</div>
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
