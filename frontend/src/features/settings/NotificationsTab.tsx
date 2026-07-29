import { Bell } from 'lucide-react'

export default function NotificationsTab() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 bg-white border border-dashed border-gray-300 rounded-2xl py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
        <Bell size={22} />
      </div>
      <p className="text-[14.5px] font-medium text-gray-800">Notifications settings coming soon</p>
      <p className="text-[13px] text-gray-500 max-w-xs">This screen is scaffolded and ready to be built out.</p>
    </div>
  )
}
