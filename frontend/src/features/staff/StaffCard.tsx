import { Link } from 'react-router-dom'
import type { StaffMember } from './types'
import { getInitials, roleLabel } from './utils'
import { totalAllTime } from '../reports/lessonFacts'
import { staffProfilePath } from '../../lib/constants'

const AVATAR_STYLES: Record<StaffMember['role'], string> = {
  secretary:  'bg-gray-100 text-gray-700',
  instructor: 'bg-success-bg text-success',
}

const BADGE_STYLES: Record<StaffMember['role'], string> = {
  secretary:  'bg-gray-100 text-gray-600',
  instructor: 'bg-success-bg text-success',
}

export default function StaffCard({ staff }: { staff: StaffMember }) {
  const lessons = staff.role === 'instructor' ? totalAllTime(staff.name.split(' ')[0]) : null

  return (
    <Link
      to={staffProfilePath(staff.id)}
      className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center text-center gap-2 hover:border-gray-300 transition-colors"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0 ${AVATAR_STYLES[staff.role]}`}>
        {getInitials(staff.name)}
      </div>
      <p className="text-[14px] font-medium text-gray-900">{staff.name}</p>
      <span className={`inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${BADGE_STYLES[staff.role]}`}>
        {roleLabel(staff.role)}
      </span>
      {lessons !== null && (
        <p className="text-[11.5px] text-gray-500">{lessons} lessons</p>
      )}
    </Link>
  )
}
