import { X } from 'lucide-react'
import ManagerSlotOccupantsList from './ManagerSlotOccupantsList'
import { formatSlotLabel } from '../shared/utils'
import type { Day, SlotAssignment } from '../shared/types'

interface ManagerSlotDetailBottomDrawerProps {
  day: Day
  hour: number
  assignments: SlotAssignment[]
  onClose: () => void
}

export default function ManagerSlotDetailBottomDrawer({ day, hour, assignments, onClose }: ManagerSlotDetailBottomDrawerProps) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[75vh] bg-white rounded-t-2xl shadow-modal flex flex-col">
        <div className="flex items-center justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-200 shrink-0">
          <p className="text-[14px] font-semibold text-gray-900">{formatSlotLabel(day, hour, true)}</p>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <ManagerSlotOccupantsList assignments={assignments} />
        </div>
      </div>
    </div>
  )
}
