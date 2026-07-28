import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import StatusBadge from '../shared/StatusBadge'
import SourceBadge from '../shared/SourceBadge'
import { getInitials } from '../shared/utils'
import { studentProfilePath } from '../../students/shared/utils'
import type { AttendanceRecord } from '../shared/types'

function Card({ record }: { record: AttendanceRecord }) {
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
        <span className={`text-[12px] inline-flex items-center gap-1 shrink-0 ${record.lessonsLeft <= 3 ? 'text-warning font-medium' : 'text-gray-500'}`}>
          {record.lessonsLeft <= 3 && <AlertTriangle size={12} />}
          {record.lessonsLeft} left
        </span>
      </div>

      {record.checkInTime && (
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-600">
          <span>{record.checkInTime}</span>
          {record.source && <SourceBadge source={record.source} />}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {record.status ? <StatusBadge status={record.status} /> : <span className="text-[12px] text-gray-400">Unmarked</span>}
      </div>
    </div>
  )
}

interface ManagerAttendanceCardListProps {
  records: AttendanceRecord[]
}

export default function ManagerAttendanceCardList({ records }: ManagerAttendanceCardListProps) {
  return (
    <div className="md:hidden flex flex-col gap-3">
      {records.map((r) => <Card key={r.id} record={r} />)}
      {records.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No students scheduled today.
        </div>
      )}
    </div>
  )
}
