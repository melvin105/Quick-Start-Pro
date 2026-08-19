import { Link } from 'react-router-dom'
import { getInitials } from '../shared/utils'
import { studentProfilePath } from '../../students/shared/utils'
import type { CellAssignment } from '../shared/schedulingMappers'

interface ManagerSlotOccupantsListProps {
  assignments: CellAssignment[]
}

export default function ManagerSlotOccupantsList({ assignments }: ManagerSlotOccupantsListProps) {
  if (assignments.length === 0) {
    return <p className="text-[13px] text-gray-500 text-center py-6">No students in this slot.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {assignments.map((a) => (
        <div key={a.studentId} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[11px] font-semibold shrink-0">
              {getInitials(a.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-gray-900 truncate">{a.name}</p>
              <p className="text-[11.5px] text-gray-500">{a.studentNumber}</p>
            </div>
          </div>
          <p className="text-[12px] font-medium text-gray-600">
            {a.lessonsRemaining} lesson{a.lessonsRemaining === 1 ? '' : 's'} left
          </p>
          <Link to={studentProfilePath(a.studentId)} className="text-[12px] font-medium text-brand-600 hover:text-brand-700">
            View Profile →
          </Link>
        </div>
      ))}
    </div>
  )
}
