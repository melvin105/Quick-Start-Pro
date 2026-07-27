import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { MOCK_STUDENTS } from '../shared/mockData'
import { formatSlotLabel } from '../shared/utils'
import type { Day, SlotAssignment } from '../shared/types'

interface MobileSlotSheetProps {
  day: Day
  hour: number
  assignments: SlotAssignment[]
  onAssign: (studentId: string) => void
  onRemove: (studentId: string) => void
  onClose: () => void
}

export default function MobileSlotSheet({ day, hour, assignments, onAssign, onRemove, onClose }: MobileSlotSheetProps) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const assignedIds = assignments.map((a) => a.studentId)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK_STUDENTS
      .filter((s) => !assignedIds.includes(s.id))
      .filter((s) => q === '' || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
      .slice(0, 6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, assignments])

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl shadow-modal flex flex-col">
        <div className="flex items-center justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="px-5 pb-3 border-b border-gray-200 shrink-0">
          <p className="text-[14.5px] font-semibold text-gray-900">{formatSlotLabel(day, hour, true)}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student..."
              className="w-full pl-8 pr-3 py-2.5 text-[13.5px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
            />
          </div>

          {assignments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {assignments.map((a) => {
                const student = MOCK_STUDENTS.find((s) => s.id === a.studentId)
                if (!student) return null
                const [first, last] = student.name.split(' ')
                return (
                  <button
                    key={a.studentId}
                    type="button"
                    onClick={() => onRemove(a.studentId)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-50 text-brand-600 text-[12.5px] font-medium rounded-full hover:bg-brand-100 transition-colors"
                  >
                    {first} {last?.[0]}.
                    <X size={12} />
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-col gap-1">
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
            {query.trim() !== '' && results.length === 0 && (
              <p className="text-[12.5px] text-gray-400 px-2.5 py-3 text-center">No matching students.</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 shrink-0 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-[13.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedId}
            onClick={() => { if (selectedId) { onAssign(selectedId); setSelectedId(null); setQuery('') } }}
            className="flex-1 px-4 py-2.5 text-[13.5px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  )
}
