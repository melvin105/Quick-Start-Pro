import { Link } from 'react-router-dom'
import { AlertTriangle, SquarePen } from 'lucide-react'
import StatusBadge from './StatusBadge'
import SourceBadge from './SourceBadge'
import MarkDropdown from '../secretary/MarkDropdown'
import InlineLessonsEdit from '../secretary/InlineLessonsEdit'
import { useAttendanceRow } from '../secretary/useAttendanceRow'
import { getInitials } from './utils'
import { studentProfilePath } from '../../students/shared/utils'
import type { AttendanceRecord } from './types'

const COLUMNS = ['Student', 'Slot', 'Check-in Time', 'Driver', 'Lessons Left', 'Status']

function Row({ record }: { record: AttendanceRecord }) {
  const { editing, setEditing, handleMark, handleSaveLessons, showEditableLessons } = useAttendanceRow(record)

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
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-[13px] inline-flex items-center gap-1 ${record.lessonsLeft <= 3 ? 'text-warning font-medium' : 'text-gray-900'}`}>
          {record.lessonsLeft <= 3 && <AlertTriangle size={12} />}
          {record.lessonsLeft} left
        </span>
      </td>
      <td className="px-4 py-3">
        {!record.status || editing ? (
          <MarkDropdown onMark={handleMark} />
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={record.status} />
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-[11.5px] font-medium text-gray-500 hover:text-brand-600 flex items-center gap-0.5"
              >
                <SquarePen size={11} /> Edit
              </button>
            </div>
            {showEditableLessons && (
              <InlineLessonsEdit initialValue={record.lessonsLeft} onSave={handleSaveLessons} />
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

interface AttendanceTableProps {
  records: AttendanceRecord[]
}

export default function AttendanceTable({ records }: AttendanceTableProps) {
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
            {records.map((r) => <Row key={r.id} record={r} />)}
          </tbody>
        </table>
      </div>
      {records.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No students scheduled today.</div>
      )}
    </div>
  )
}
