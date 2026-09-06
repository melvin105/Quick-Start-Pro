import { useNavigate } from 'react-router-dom'
import type { StudentListItem } from './studentMappers'
import StatusBadge from './StatusBadge'
import StudentAvatar from './StudentAvatar'
import { formatGHS, studentProfilePath } from './utils'

interface StudentCardListProps {
  students: StudentListItem[]
  returnTo?: string
}

export default function StudentCardList({ students, returnTo }: StudentCardListProps) {
  const navigate = useNavigate()

  return (
    <div className="md:hidden flex flex-col gap-3">
      {students.map((student) => (
        <button
          key={student.id}
          type="button"
          onClick={() => navigate(studentProfilePath(student.id, returnTo))}
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-4 text-left w-full hover:border-gray-300 transition-colors"
        >
          <StudentAvatar name={student.name} photo={student.photo} className="w-10 h-10 text-[12px]" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-gray-900 truncate">{student.name}</p>
            <p className="text-[12.5px] text-gray-500 truncate">
              {student.enrolment} · {formatGHS(student.balance)}
            </p>
          </div>
          <StatusBadge status={student.status} />
        </button>
      ))}

      {students.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No students match your filters.
        </div>
      )}
    </div>
  )
}
