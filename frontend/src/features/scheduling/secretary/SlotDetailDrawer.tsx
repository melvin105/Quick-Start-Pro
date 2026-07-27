import { X, Plus } from 'lucide-react'
import SlotOccupantsList from './SlotOccupantsList'
import { formatSlotLabel } from '../shared/utils'
import type { Day, SlotAssignment } from '../shared/types'

interface SlotDetailDrawerProps {
  day: Day
  hour: number
  assignments: SlotAssignment[]
  onClear: (studentId: string) => void
  onAssignAnother: () => void
  onClose: () => void
}

export default function SlotDetailDrawer({ day, hour, assignments, onClear, onAssignAnother, onClose }: SlotDetailDrawerProps) {
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
          <SlotOccupantsList assignments={assignments} onClear={onClear} />
        </div>
        <div className="p-4 border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onAssignAnother}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Plus size={15} /> Assign Another Student
          </button>
        </div>
      </div>
    </div>
  )
}
