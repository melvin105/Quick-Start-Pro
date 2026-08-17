import { X } from 'lucide-react'
import ManagerSlotOccupantsList from './ManagerSlotOccupantsList'
import { formatSlotLabel } from '../shared/utils'
import type { CellAssignment } from '../shared/schedulingMappers'
import type { Day } from '../shared/types'

interface ManagerSlotDetailDrawerProps {
  day: Day
  hour: number
  assignments: CellAssignment[]
  onClose: () => void
}

export default function ManagerSlotDetailDrawer({ day, hour, assignments, onClose }: ManagerSlotDetailDrawerProps) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-80 max-w-[90%] bg-white shadow-modal flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200 shrink-0">
          <p className="text-[14px] font-semibold text-gray-900">{formatSlotLabel(day, hour)}</p>
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
