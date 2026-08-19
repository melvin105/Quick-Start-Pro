import { Users } from 'lucide-react'
import { findStudentCellSlots, isCellFull, type ScheduleGridData } from '../shared/schedulingMappers'
import { formatSlotLabel, slotKey } from '../shared/utils'
import AssignConfirmation from './AssignConfirmation'
import type { Day } from '../shared/types'

interface DragAssignModalProps {
  day: Day
  hour: number
  grid: ScheduleGridData
  studentId: string
  studentName: string
  fromDay: Day
  fromHour: number
  onConfirm: () => void
  onCancel: () => void
}

export default function DragAssignModal({
  day, hour, grid, studentId, studentName, fromDay, fromHour, onConfirm, onCancel,
}: DragAssignModalProps) {
  const targetCell = grid[slotKey(day, hour)]
  const full = isCellFull(targetCell)
  const capacity = targetCell?.capacity ?? 0
  const existingSlots = findStudentCellSlots(grid, studentId).filter(
    (s) => !(s.day === day && s.hour === hour) && !(s.day === fromDay && s.hour === fromHour),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5">
        {full ? (
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            <Users size={20} className="text-gray-300" />
            <p className="text-[13px] font-medium text-gray-700">This slot is full</p>
            <p className="text-[12px] text-gray-500">
              Max {capacity} student{capacity === 1 ? '' : 's'} per hour — one per instructor.
            </p>
            <button
              type="button"
              onClick={onCancel}
              className="mt-1 px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <AssignConfirmation
            mode="move"
            studentName={studentName}
            targetLabel={formatSlotLabel(day, hour, true)}
            sourceLabel={formatSlotLabel(fromDay, fromHour, true)}
            existingSlots={existingSlots}
            confirmLabel="Move"
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  )
}
