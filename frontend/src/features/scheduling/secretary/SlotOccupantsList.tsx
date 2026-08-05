import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Bell, Check } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import useStudentsStore from '../../students/shared/store'
import useSchedulingStore from '../shared/store'
import { getInitials } from '../shared/utils'
import { findStudentSlots, formatSlotLabel } from '../shared/utils'
import { remainingLessons } from '../../students/shared/utils'
import type { Day, SlotAssignment } from '../shared/types'
import { ROUTES } from '../../../lib/constants'

interface SlotOccupantsListProps {
  day: Day
  hour: number
  assignments: SlotAssignment[]
  onClear: (studentId: string) => void
}

export default function SlotOccupantsList({ day, hour, assignments, onClear }: SlotOccupantsListProps) {
  const students = useStudentsStore((s) => s.students)
  const grid = useSchedulingStore((s) => s.grid)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleShareSchedule = (studentName: string, studentId: string) => {
    const slotCount = findStudentSlots(grid, studentId).length
    showToast(`Schedule shared with ${studentName} via SMS — ${slotCount} lesson${slotCount === 1 ? '' : 's'} this week`)
  }

  const handleSendReminder = (studentName: string) => {
    showToast(`Reminder sent to ${studentName} — ${formatSlotLabel(day, hour, true)}`)
  }

  if (assignments.length === 0) {
    return <p className="text-[13px] text-gray-500 text-center py-6">No students in this slot.</p>
  }

  const confirmStudent = confirmId ? students.find((s) => s.id === confirmId) : undefined

  return (
    <div className="flex flex-col gap-3">
      {assignments.map((a) => {
        const student = students.find((s) => s.id === a.studentId)
        if (!student) return null
        const remaining = remainingLessons(student)
        return (
          <div key={a.studentId} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[11px] font-semibold shrink-0">
                {getInitials(student.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-gray-900 truncate">{student.name}</p>
                <p className="text-[11.5px] text-gray-500">{student.id}</p>
              </div>
            </div>
            <p className="text-[12px] font-medium text-gray-600">
              {remaining} lesson{remaining === 1 ? '' : 's'} left
            </p>
            <div className="flex items-center justify-between">
              <Link to={ROUTES.STUDENTS} className="text-[12px] font-medium text-brand-600 hover:text-brand-700">
                View Profile →
              </Link>
              <button
                type="button"
                onClick={() => setConfirmId(a.studentId)}
                className="text-[12px] font-medium text-danger hover:opacity-80"
              >
                Clear Slot
              </button>
            </div>
            <div className="flex items-center gap-3 pt-2 mt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleShareSchedule(student.name, student.id)}
                className="flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-brand-600 transition-colors"
              >
                <MessageSquare size={12} /> Share Schedule
              </button>
              <button
                type="button"
                onClick={() => handleSendReminder(student.name)}
                className="flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-brand-600 transition-colors"
              >
                <Bell size={12} /> Send Reminder
              </button>
            </div>
          </div>
        )
      })}

      {confirmStudent && (
        <ConfirmDialog
          title="Remove student?"
          message={`Remove ${confirmStudent.name} from this slot?`}
          confirmLabel="Remove"
          onConfirm={() => { onClear(confirmStudent.id); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <Check size={15} className="text-success" />
          {toast}
        </div>
      )}
    </div>
  )
}
