import { Link } from 'react-router-dom'
import { ROUTES } from '../../../lib/constants'

export interface ScheduleItem {
  time: string
  initials: string
  name: string
  status: 'completed' | 'upcoming' | 'absent' | 'excused'
}

interface TodaysScheduleProps {
  items: ScheduleItem[]
}

const STATUS_STYLES: Record<ScheduleItem['status'], string> = {
  completed: 'bg-success-bg text-success',
  upcoming:  'bg-warning-bg text-warning',
  absent:    'bg-danger-bg text-danger',
  excused:   'bg-gray-100 text-gray-600',
}

const STATUS_LABEL: Record<ScheduleItem['status'], string> = {
  completed: 'Completed',
  upcoming:  'Upcoming',
  absent:    'Absent',
  excused:   'Excused',
}

export default function TodaysSchedule({ items }: TodaysScheduleProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 h-full">
      <h2 className="text-[14.5px] font-semibold text-gray-900 mb-3">Today's Schedule</h2>
      {items.length === 0 ? (
        <p className="text-[13px] text-gray-500 py-6 text-center">No lessons scheduled for today.</p>
      ) : (
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <span className="text-[12.5px] text-gray-500 w-11 shrink-0">{item.time}</span>
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[11px] font-semibold shrink-0">
              {item.initials}
            </div>
            <p className="text-[13.5px] font-medium text-gray-900 truncate min-w-0 flex-1">{item.name}</p>
            <span className={`text-[11px] font-medium px-2 py-1 rounded-full shrink-0 ${STATUS_STYLES[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
          </div>
        ))}
      </div>
      )}
      <Link to={ROUTES.ATTENDANCE} className="block text-right text-[12.5px] font-medium text-brand-600 hover:text-brand-700 mt-3">
        View Schedule →
      </Link>
    </div>
  )
}
