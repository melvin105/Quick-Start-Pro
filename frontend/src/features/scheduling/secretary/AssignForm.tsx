import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { findStudentCellSlots, findStudentIdsAssignedOnDay, type ScheduleGridData } from '../shared/schedulingMappers'
import { useAssignableStudents } from '../shared/useAssignableStudents'
import { formatSlotLabel } from '../shared/utils'
import AssignConfirmation from './AssignConfirmation'
import type { Day } from '../shared/types'

interface AssignFormProps {
  day: Day
  hour: number
  grid: ScheduleGridData
  capacity: number
  excludeIds: string[]
  onAssign: (studentId: string) => void
  onCancel: () => void
}

export default function AssignForm({ day, hour, grid, capacity, excludeIds, onAssign, onCancel }: AssignFormProps) {
  const { students, loading, error } = useAssignableStudents()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const assignedOnDay = useMemo(() => findStudentIdsAssignedOnDay(grid, day), [day, grid])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return students
      .filter((s) => !excludeIds.includes(s.id))
      .filter((s) => !assignedOnDay.has(s.id))
      .filter((s) => q === '' || s.name.toLowerCase().includes(q) || s.studentNumber.toLowerCase().includes(q))
  }, [students, query, excludeIds, assignedOnDay])

  const selectedStudent = selectedId ? students.find((s) => s.id === selectedId) : undefined
  const slotFull = excludeIds.length >= capacity

  if (slotFull) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
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
    )
  }

  if (confirming && selectedStudent) {
    return (
      <AssignConfirmation
        studentName={selectedStudent.name}
        targetLabel={formatSlotLabel(day, hour, true)}
        existingSlots={findStudentCellSlots(grid, selectedStudent.id)}
        onConfirm={() => onAssign(selectedStudent.id)}
        onCancel={() => setConfirming(false)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search student..."
          className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
        />
      </div>

      <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
        {loading && <p className="text-[12.5px] text-gray-400 px-2.5 py-3 text-center">Loading students…</p>}
        {error && !loading && (
          <p className="text-[12.5px] text-danger px-2.5 py-3 text-center">Couldn’t load students.</p>
        )}
        {!loading && !error && results.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className={`text-left px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
              selectedId === s.id ? 'bg-brand-50 text-brand-600' : 'hover:bg-gray-50 text-gray-800'
            }`}
          >
            <p className="font-medium">{s.name}</p>
            <p className="text-[11.5px] text-gray-500">{s.studentNumber} · {s.enrolmentLabel}</p>
          </button>
        ))}
        {!loading && !error && results.length === 0 && (
          <p className="text-[12.5px] text-gray-400 px-2.5 py-3 text-center">No matching students.</p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!selectedId}
          onClick={() => selectedId && setConfirming(true)}
          className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Assign
        </button>
      </div>
    </div>
  )
}
