import { Link } from 'react-router-dom'
import StatusBadge from '../shared/StatusBadge'
import SourceBadge from '../shared/SourceBadge'
import { getInitials } from '../shared/utils'
import { studentProfilePath } from '../../students/shared/utils'
import type { AttendanceRecord } from '../shared/types'

const COLUMNS = ['Student', 'Slot', 'Check-in Time', 'Driver', 'Lessons Left', 'Source', 'Status']

function Row({ record }: { record: AttendanceRecord }) {
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
      <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{record.checkInTime ?? '—'}</td>
      <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{record.driverName ?? '—'}</td>
      <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{record.lessonsLeft} left</td>
      <td className="px-4 py-3 whitespace-nowrap">
        {record.source ? <SourceBadge source={record.source} /> : <span className="text-gray-400 text-[12px]">—</span>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {record.status ? <StatusBadge status={record.status} autoMarked={record.autoMarked} /> : <span className="text-[12px] text-gray-400">Unmarked</span>}
      </td>
    </tr>
  )
}

interface ManagerAttendanceTableProps {
  records: AttendanceRecord[]
}

export default function ManagerAttendanceTable({ records }: ManagerAttendanceTableProps) {
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
