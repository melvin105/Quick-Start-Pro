export interface ScheduleItem {
  time: string
  initials: string
  name: string
  detail: string
  status: 'confirmed' | 'pending'
}

interface TodaysScheduleProps {
  items: ScheduleItem[]
}

const STATUS_STYLES: Record<ScheduleItem['status'], string> = {
  confirmed: 'bg-success-bg text-success',
  pending:   'bg-warning-bg text-warning',
}

const STATUS_LABEL: Record<ScheduleItem['status'], string> = {
  confirmed: 'Confirmed',
  pending:   'Pending',
}

export default function TodaysSchedule({ items }: TodaysScheduleProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 h-full">
      <h2 className="text-[14.5px] font-semibold text-gray-900 mb-3">Today's Schedule</h2>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.time} className="flex items-center gap-3 py-2">
            <span className="text-[12.5px] text-gray-500 w-11 shrink-0">{item.time}</span>
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[11px] font-semibold shrink-0">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-[12px] text-gray-500 truncate">{item.detail}</p>
            </div>
            <span className={`text-[11px] font-medium px-2 py-1 rounded-full shrink-0 ${STATUS_STYLES[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
