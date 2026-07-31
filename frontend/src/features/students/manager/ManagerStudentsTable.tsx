import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'
import type { Student } from '../shared/types'
import StatusBadge from '../shared/StatusBadge'
import StudentAvatar from '../shared/StudentAvatar'
import { formatGHS, studentProfilePath } from '../shared/utils'

interface ManagerStudentsTableProps {
  students: Student[]
}

const COLUMNS = ['Student ID', 'Name', 'Phone', 'Enrolment', 'Balance', 'Status', 'View']

export default function ManagerStudentsTable({ students }: ManagerStudentsTableProps) {
  const navigate = useNavigate()

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
            {students.map((student) => (
              <tr
                key={student.id}
                onClick={() => navigate(studentProfilePath(student.id))}
                className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">{student.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <StudentAvatar name={student.name} photo={student.photo} className="w-8 h-8 text-[11px]" />
                    <span className="text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{student.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{student.phone}</td>
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{student.enrolment}</td>
                <td className={`px-4 py-3 text-[13px] whitespace-nowrap ${student.balance > 0 ? 'text-warning font-medium' : 'text-gray-900'}`}>
                  {formatGHS(student.balance)}
                </td>
                <td className="px-4 py-3"><StatusBadge status={student.status} /></td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigate(studentProfilePath(student.id)) }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    aria-label={`View ${student.name}`}
                  >
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No students match your filters.</div>
      )}
    </div>
  )
}
