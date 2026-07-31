import { Link } from 'react-router-dom'
import useStudentsStore from '../../students/shared/store'
import { getInitials } from '../shared/utils'
import { studentProfilePath, remainingLessons } from '../../students/shared/utils'
import type { SlotAssignment } from '../shared/types'

interface ManagerSlotOccupantsListProps {
  assignments: SlotAssignment[]
}

export default function ManagerSlotOccupantsList({ assignments }: ManagerSlotOccupantsListProps) {
  const students = useStudentsStore((s) => s.students)

  if (assignments.length === 0) {
    return <p className="text-[13px] text-gray-500 text-center py-6">No students in this slot.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {assignments.map((a) => {
        const student = students.find((s) => s.id === a.studentId)
        if (!student) return null
        const remaining = remainingLessons(student)
        return (
          <div key={a.studentId} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[11px] font-semibold shrink-0">
                {getInitials(student.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-gray-900 truncate">{student.name}</p>
                <p className="text-[11.5px] text-gray-500">{student.id}</p>
              </div>
            </div>
            <p className="text-[12px] font-medium text-gray-600">
              {remaining} lesson{remaining === 1 ? '' : 's'} left
            </p>
            <Link to={studentProfilePath(student.id)} className="text-[12px] font-medium text-brand-600 hover:text-brand-700">
              View Profile →
            </Link>
          </div>
        )
      })}
    </div>
  )
}
