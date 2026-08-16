import { UserPlus, Banknote, CheckCircle2, type LucideIcon } from 'lucide-react'

export interface ActivityItem {
  icon: 'student' | 'payment' | 'attendance'
  text: string
  time: string
}

const ICONS: Record<ActivityItem['icon'], LucideIcon> = {
  student:    UserPlus,
  payment:    Banknote,
  attendance: CheckCircle2,
}

const ICON_TONES: Record<ActivityItem['icon'], string> = {
  student:    'bg-brand-50 text-brand-600',
  payment:    'bg-success-bg text-success',
  attendance: 'bg-brand-50 text-brand-600',
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 h-full">
      <h2 className="text-[14.5px] font-semibold text-gray-900 mb-3">Recent Activity</h2>
      {items.length === 0 ? (
        <p className="text-[13px] text-gray-500 py-6 text-center">No recent activity.</p>
      ) : (
      <div className="space-y-3">
        {items.map((item, i) => {
          const Icon = ICONS[item.icon]
          return (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${ICON_TONES[item.icon]}`}>
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-gray-800">{item.text}</p>
                <p className="text-[11.5px] text-gray-500">{item.time}</p>
              </div>
            </div>
          )
        })}
      </div>
      )}
    </div>
  )
}
