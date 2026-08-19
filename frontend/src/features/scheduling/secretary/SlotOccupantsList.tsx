import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Bell, Check } from 'lucide-react'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import { findStudentCellSlots, type CellAssignment, type ScheduleGridData } from '../shared/schedulingMappers'
import { getInitials, formatSlotLabel } from '../shared/utils'
import { studentProfilePath } from '../../students/shared/utils'
import type { Day } from '../shared/types'

interface SlotOccupantsListProps {
  day: Day
  hour: number
  grid: ScheduleGridData
  assignments: CellAssignment[]
  onClear: (studentId: string) => void
}

export default function SlotOccupantsList({ day, hour, grid, assignments, onClear }: SlotOccupantsListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleShareSchedule = (studentName: string, studentId: string) => {
    const slotCount = findStudentCellSlots(grid, studentId).length
    showToast(`Schedule shared with ${studentName} via SMS — ${slotCount} lesson${slotCount === 1 ? '' : 's'} this week`)
  }

  const handleSendReminder = (studentName: string) => {
    showToast(`Reminder sent to ${studentName} — ${formatSlotLabel(day, hour, true)}`)
  }

  if (assignments.length === 0) {
    return <p className="text-[13px] text-gray-500 text-center py-6">No students in this slot.</p>
  }

  const confirmStudent = confirmId ? assignments.find((a) => a.studentId === confirmId) : undefined

  return (
    <div className="flex flex-col gap-3">
      {assignments.map((a) => (
        <div key={a.studentId} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[11px] font-semibold shrink-0">
              {getInitials(a.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-gray-900 truncate">{a.name}</p>
              <p className="text-[11.5px] text-gray-500">{a.studentNumber}</p>
            </div>
          </div>
          <p className="text-[12px] font-medium text-gray-600">
            {a.lessonsRemaining} lesson{a.lessonsRemaining === 1 ? '' : 's'} left
          </p>
          <div className="flex items-center justify-between">
            <Link to={studentProfilePath(a.studentId)} className="text-[12px] font-medium text-brand-600 hover:text-brand-700">
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
              onClick={() => handleShareSchedule(a.name, a.studentId)}
              className="flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              <MessageSquare size={12} /> Share Schedule
            </button>
            <button
              type="button"
              onClick={() => handleSendReminder(a.name)}
              className="flex items-center gap-1 text-[12px] font-medium text-gray-600 hover:text-brand-600 transition-colors"
            >
              <Bell size={12} /> Send Reminder
            </button>
          </div>
        </div>
      ))}

      {confirmStudent && (
        <ConfirmDialog
          title="Remove student?"
          message={`Remove ${confirmStudent.name} from this slot?`}
          confirmLabel="Remove"
          onConfirm={() => { onClear(confirmStudent.studentId); setConfirmId(null) }}
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
