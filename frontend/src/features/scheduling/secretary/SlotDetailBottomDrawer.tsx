import { X, Plus } from 'lucide-react'
import SlotOccupantsList from './SlotOccupantsList'
import { formatSlotLabel, isSlotFull, MAX_STUDENTS_PER_SLOT } from '../shared/utils'
import type { Day, SlotAssignment } from '../shared/types'

interface SlotDetailBottomDrawerProps {
  day: Day
  hour: number
  assignments: SlotAssignment[]
  onClear: (studentId: string) => void
  onAssignAnother: () => void
  onClose: () => void
}

export default function SlotDetailBottomDrawer({
  day, hour, assignments, onClear, onAssignAnother, onClose,
}: SlotDetailBottomDrawerProps) {
  const full = isSlotFull(assignments)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[75vh] bg-white rounded-t-2xl shadow-modal flex flex-col">
        <div className="flex items-center justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-200 shrink-0">
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
          <SlotOccupantsList day={day} hour={hour} assignments={assignments} onClear={onClear} />
        </div>
        <div className="p-4 border-t border-gray-200 shrink-0">
          <button
            type="button"
            disabled={full}
            onClick={onAssignAnother}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Plus size={15} /> Assign Another Student
          </button>
          {full && (
            <p className="text-[11.5px] text-gray-500 text-center mt-2">
              Slot full — max {MAX_STUDENTS_PER_SLOT} per hour (one per instructor)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
