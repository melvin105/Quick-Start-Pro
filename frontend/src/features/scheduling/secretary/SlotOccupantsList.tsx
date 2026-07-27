import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'
import { MOCK_STUDENTS } from '../shared/mockData'
import { lessonTone, getInitials } from '../shared/utils'
import type { SlotAssignment } from '../shared/types'
import { ROUTES } from '../../../lib/constants'

interface SlotOccupantsListProps {
  assignments: SlotAssignment[]
  onClear: (studentId: string) => void
}

export default function SlotOccupantsList({ assignments, onClear }: SlotOccupantsListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  if (assignments.length === 0) {
    return <p className="text-[13px] text-gray-500 text-center py-6">No students in this slot.</p>
  }

  const confirmStudent = confirmId ? MOCK_STUDENTS.find((s) => s.id === confirmId) : undefined

  return (
    <div className="flex flex-col gap-3">
      {assignments.map((a) => {
        const student = MOCK_STUDENTS.find((s) => s.id === a.studentId)
        if (!student) return null
        const tone = lessonTone(a.lessonsRemaining)
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
            <p
              className={`text-[12px] font-medium flex items-center gap-1 ${
                tone === 'amber' ? 'text-warning' : tone === 'grey' ? 'text-gray-400' : 'text-success'
              }`}
            >
              {tone === 'amber' && <AlertTriangle size={12} />}
              {a.lessonsRemaining} lesson{a.lessonsRemaining === 1 ? '' : 's'} left
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
    </div>
  )
}
