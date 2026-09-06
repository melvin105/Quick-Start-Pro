import { useMemo, useState } from 'react'
import { CalendarPlus, Search, UserCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { studentProfilePath } from '../../students/shared/utils'
import type { ApiUnscheduledStudent } from './schedulingService'

interface UnscheduledStudentsPanelProps {
  students: ApiUnscheduledStudent[]
  standalone?: boolean
}

export default function UnscheduledStudentsPanel({ students, standalone = false }: UnscheduledStudentsPanelProps) {
  const [query, setQuery] = useState('')
  const filteredStudents = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return students
    return students.filter((student) =>
      student.studentName.toLowerCase().includes(normalized)
      || student.studentNumber.toLowerCase().includes(normalized)
      || student.packageName?.toLowerCase().includes(normalized),
    )
  }, [query, students])

  return (
    <section className={`bg-white border border-gray-200 rounded-2xl min-h-0 flex flex-col overflow-hidden ${
      standalone ? 'min-h-[420px]' : ''
    }`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-warning flex items-center justify-center shrink-0">
              <Users size={16} />
            </span>
            <div>
              {standalone ? (
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Unscheduled Students</h1>
              ) : (
                <h2 className="text-[13.5px] font-semibold text-gray-900">Unscheduled Students</h2>
              )}
              <p className="text-[11.5px] text-gray-500 mt-0.5">Active students without a weekly lesson slot.</p>
            </div>
          </div>
          <span className="text-[11.5px] font-semibold text-warning bg-amber-50 rounded-full px-2.5 py-1">
            {students.length}
          </span>
        </div>

        {students.length > 0 && (
          <div className="relative mt-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search students..."
              aria-label="Search unscheduled students"
              className="w-full pl-8 pr-3 py-2 text-[12.5px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
            />
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-100">
        {students.length === 0 && (
          <div className="h-full min-h-40 flex flex-col items-center justify-center text-center p-5">
            <UserCheck size={24} className="text-green-500 mb-2" />
            <p className="text-[13px] font-medium text-gray-700">Everyone is scheduled</p>
            <p className="text-[11.5px] text-gray-500 mt-1">All active driving students have a weekly slot.</p>
          </div>
        )}

        {students.length > 0 && filteredStudents.length === 0 && (
          <p className="text-[12.5px] text-gray-400 text-center px-4 py-8">No matching students.</p>
        )}

        {filteredStudents.map((student) => (
          <div key={student.id} className="p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-gray-900 truncate">{student.studentName}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                  {student.studentNumber} · {student.packageName ?? 'No package'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {student.lessonsRemaining} lesson{student.lessonsRemaining === 1 ? '' : 's'} remaining
                </p>
              </div>
              <Link
                to={studentProfilePath(student.id)}
                className="shrink-0 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-600 hover:text-brand-700"
              >
                <CalendarPlus size={13} />
                Assign
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
