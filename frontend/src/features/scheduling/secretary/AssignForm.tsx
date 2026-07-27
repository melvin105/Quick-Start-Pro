import { useMemo, useState } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
import useSchedulingStore from '../shared/store'
import { MOCK_STUDENTS } from '../shared/mockData'
import { findStudentSlot, formatSlotLabel } from '../shared/utils'
import type { Day } from '../shared/types'

interface AssignFormProps {
  day: Day
  hour: number
  excludeIds: string[]
  onAssign: (studentId: string) => void
  onCancel: () => void
}

export default function AssignForm({ day, hour, excludeIds, onAssign, onCancel }: AssignFormProps) {
  const grid = useSchedulingStore((s) => s.grid)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK_STUDENTS
      .filter((s) => !excludeIds.includes(s.id))
      .filter((s) => q === '' || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
  }, [query, excludeIds])

  const conflict = selectedId ? findStudentSlot(grid, selectedId) : undefined
  const conflictIsSameSlot = conflict && conflict.day === day && conflict.hour === hour
  const selectedStudent = selectedId ? MOCK_STUDENTS.find((s) => s.id === selectedId) : undefined

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
        {results.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedId(s.id)}
            className={`text-left px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
              selectedId === s.id ? 'bg-brand-50 text-brand-600' : 'hover:bg-gray-50 text-gray-800'
            }`}
          >
            <p className="font-medium">{s.name}</p>
            <p className="text-[11.5px] text-gray-500">{s.id} · {s.enrolment}</p>
          </button>
        ))}
        {results.length === 0 && (
          <p className="text-[12.5px] text-gray-400 px-2.5 py-3 text-center">No matching students.</p>
        )}
      </div>

      {conflict && !conflictIsSameSlot && selectedStudent && (
        <div className="flex items-start gap-1.5 bg-warning-bg text-warning text-[12px] px-2.5 py-2 rounded-lg">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <span>
            {selectedStudent.name} already has a slot on {formatSlotLabel(conflict.day, conflict.hour, true)}.
            Assign to this slot as well?
          </span>
        </div>
      )}

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
          onClick={() => selectedId && onAssign(selectedId)}
          className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Assign
        </button>
      </div>
    </div>
  )
}
