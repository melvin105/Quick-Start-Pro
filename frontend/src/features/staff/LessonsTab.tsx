import { Link } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import { useApiResource } from '../../lib/useApiResource'
import { listInstructorLessons } from './staffService'
import type { StaffMember } from './types'
import { studentProfilePath } from '../students/shared/utils'

export default function LessonsTab({ staff }: { staff: StaffMember }) {
  const { data: lessons, loading, error, refetch } = useApiResource(() => listInstructorLessons(staff.id), [staff.id])

  if (loading) return <LoadingState message="Loading lessons…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const rows = lessons ?? []
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 6)
  const monthKey = today.toISOString().slice(0, 7)
  const thisMonth = rows.filter((lesson) => lesson.lessonDate.startsWith(monthKey)).length
  const thisWeek = rows.filter((lesson) => new Date(`${lesson.lessonDate}T00:00:00`) >= weekAgo).length

  if (rows.length === 0) {
    return <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">No lessons recorded yet.</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total All Time" value={String(staff.lessonsCount)} />
        <StatCard label="This Month" value={String(thisMonth)} />
        <StatCard label="This Week" value={String(thisWeek)} />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-gray-200">
              {['Date', 'Time', 'Student', 'Status'].map((label) => <th key={label} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{label}</th>)}
            </tr></thead>
            <tbody>{rows.map((lesson) => (
              <tr key={lesson.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-[13px] text-gray-700">{lesson.lessonDate}</td>
                <td className="px-4 py-3 text-[13px] text-gray-700">{lesson.startTime.slice(0, 5)}</td>
                <td className="px-4 py-3 text-[13px] font-medium text-gray-900"><Link className="hover:text-brand-600" to={studentProfilePath(lesson.studentId)}>{lesson.studentName}</Link></td>
                <td className="px-4 py-3 text-[13px] capitalize text-gray-700">{lesson.status}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
