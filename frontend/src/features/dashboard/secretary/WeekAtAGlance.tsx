import type { DayCount } from '../dashboardPresenters'

interface WeekAtAGlanceProps {
  days: DayCount[]
}

export default function WeekAtAGlance({ days }: WeekAtAGlanceProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      <h2 className="text-[14.5px] font-semibold text-gray-900 mb-3">This Week's Schedule</h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map(({ day, count }) => (
          <div key={day} className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-gray-50">
            <span className="text-[11px] font-medium text-gray-500">{day}</span>
            <span className="text-[15px] font-semibold text-gray-900">{count}</span>
            <span className="text-[10.5px] text-gray-400">lessons</span>
          </div>
        ))}
      </div>
    </div>
  )
}
