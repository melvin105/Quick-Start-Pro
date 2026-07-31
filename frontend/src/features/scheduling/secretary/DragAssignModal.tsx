import { Users } from 'lucide-react'
import useSchedulingStore from '../shared/store'
import useStudentsStore from '../../students/shared/store'
import { findStudentSlots, formatSlotLabel, isSlotFull, MAX_STUDENTS_PER_SLOT, slotKey } from '../shared/utils'
import AssignConfirmation from './AssignConfirmation'
import type { Day } from '../shared/types'

interface DragAssignModalProps {
  day: Day
  hour: number
  studentId: string
  fromDay: Day
  fromHour: number
  onConfirm: () => void
  onCancel: () => void
}

export default function DragAssignModal({ day, hour, studentId, fromDay, fromHour, onConfirm, onCancel }: DragAssignModalProps) {
  const grid = useSchedulingStore((s) => s.grid)
  const students = useStudentsStore((s) => s.students)
  const student = students.find((s) => s.id === studentId)
  if (!student) return null

  const targetAssignments = grid[slotKey(day, hour)] ?? []
  const full = isSlotFull(targetAssignments)
  const existingSlots = findStudentSlots(grid, studentId).filter(
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
              Max {MAX_STUDENTS_PER_SLOT} student{MAX_STUDENTS_PER_SLOT === 1 ? '' : 's'} per hour — one per instructor.
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
            studentName={student.name}
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
