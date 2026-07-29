import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import FilterDropdown from '../students/shared/FilterDropdown'
import { totalAllTime, lessonsInRange, monthlyBreakdown, studentBreakdown } from '../reports/lessonFacts'
import { studentProfilePath } from '../students/shared/utils'
import useStudentsStore from '../students/shared/store'
import { computePeriodRange, type PeriodRange } from '../finances/period'
import { firstName } from './utils'
import type { StaffMember } from './types'

type StudentPeriodKey = 'this-week' | 'this-month' | 'last-month' | 'all-time'

const PERIOD_OPTIONS: { value: StudentPeriodKey; label: string }[] = [
  { value: 'this-week',  label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'all-time',   label: 'All Time' },
]

function thisWeekRange(): PeriodRange {
  const to = new Date().toISOString().slice(0, 10)
  const start = new Date()
  start.setDate(start.getDate() - 6)
  return { from: start.toISOString().slice(0, 10), to }
}

function rangeFor(period: StudentPeriodKey): PeriodRange {
  if (period === 'this-week') return thisWeekRange()
  if (period === 'last-month') return computePeriodRange('last-month')
  if (period === 'all-time') return { from: '2000-01-01', to: '2100-01-01' }
  return computePeriodRange('this-month')
}

export default function LessonsTab({ staff }: { staff: StaffMember }) {
  const navigate = useNavigate()
  const instructor = firstName(staff.name)
  const students = useStudentsStore((s) => s.students)
  const [studentPeriod, setStudentPeriod] = useState<StudentPeriodKey>('this-week')

  const total = totalAllTime(instructor)
  const thisMonth = lessonsInRange(instructor, computePeriodRange('this-month').from, computePeriodRange('this-month').to).length
  const thisWeek = lessonsInRange(instructor, thisWeekRange().from, thisWeekRange().to).length

  const monthly = monthlyBreakdown(instructor)

  const studentRange = rangeFor(studentPeriod)
  const byStudent = studentBreakdown(instructor, studentRange.from, studentRange.to)

  const findStudentId = (name: string) => students.find((s) => s.name === name)?.id

  if (total === 0) {
    return (
      <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
        No lessons recorded yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total All Time" value={String(total)} />
        <StatCard label="This Month" value={String(thisMonth)} />
        <StatCard label="This Week" value={String(thisWeek)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
          <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Monthly Breakdown</h2>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 sticky top-0 bg-white">
                  <th className="pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Month</th>
                  <th className="pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-right">Lessons</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((m) => (
                  <tr key={m.label} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-[13px] text-gray-700">{m.label}</td>
                    <td className="py-2 text-[13px] text-gray-900 text-right">{m.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Lessons by Student</h2>
            <FilterDropdown label="Period" value={studentPeriod} options={PERIOD_OPTIONS} onChange={(v) => setStudentPeriod(v as StudentPeriodKey)} />
          </div>

          {byStudent.length === 0 ? (
            <p className="py-8 text-center text-[12.5px] text-gray-400">No lessons in this period.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-right">Lessons</th>
                  <th className="pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {byStudent.map((row) => {
                  const id = findStudentId(row.student)
                  return (
                    <tr
                      key={row.student}
                      onClick={id ? () => navigate(studentProfilePath(id)) : undefined}
                      className={`border-b border-gray-100 last:border-0 transition-colors ${id ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                    >
                      <td className="py-2 text-[13px] font-medium text-gray-900">{row.student}</td>
                      <td className="py-2 text-[13px] text-gray-900 text-right">{row.period}</td>
                      <td className="py-2 text-[13px] text-gray-600 text-right">{row.total}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Link
        to={`/manager/attendance/history?driver=${instructor}`}
        className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700 self-start"
      >
        View all attendance records for {instructor} →
      </Link>
    </div>
  )
}
