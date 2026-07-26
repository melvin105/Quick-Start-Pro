import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, SquarePen, ChevronDown, Archive, Printer } from 'lucide-react'
import type { Student } from '../types'
import StatusBadge from '../StatusBadge'
import { getInitials, studentEditPath, formatGHS } from '../utils'
import { ROUTES } from '../../../lib/constants'

export default function ProfileHeader({ student }: { student: Student }) {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-gray-500">Dashboard / Students / {student.name}</p>
        <Link to={ROUTES.STUDENTS} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
          <ArrowLeft size={14} /> Back to Students
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[17px] font-semibold shrink-0">
            {getInitials(student.name)}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{student.name}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[12.5px] text-gray-500">{student.id}</span>
              <span className="inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                {student.programme ? `${student.programme} (${student.enrolment})` : student.enrolment}
              </span>
              <StatusBadge status={student.status} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Link
              to={studentEditPath(student.id)}
              className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SquarePen size={14} />
              Edit Profile
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((p) => !p)}
                className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                More <ChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-card overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Printer size={14} /> Print ID Card
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Archive size={14} /> Archive Student
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {student.balance > 0 && (
            <p className="text-[13px] font-medium text-danger">Outstanding {formatGHS(student.balance)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
