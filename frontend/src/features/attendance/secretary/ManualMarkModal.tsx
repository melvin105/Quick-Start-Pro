import { useMemo, useState } from 'react'
import { Search, AlertCircle } from 'lucide-react'
import { useApiResource } from '../../../lib/useApiResource'
import { listStudents } from '../../students/shared/studentService'
import { markAttendance, type ApiAttendanceStatus } from '../shared/attendanceService'
import type { ApiError } from '../../../lib/apiError'

interface ManualMarkModalProps {
  title?: string
  onClose: () => void
  // Called after a successful mark so the page can refetch the roster.
  onMarked: () => void
}

const STATUS_OPTIONS: { value: ApiAttendanceStatus; label: string; activeClass: string }[] = [
  { value: 'present', label: 'Present', activeClass: 'border-success bg-success-bg text-success' },
  { value: 'absent',  label: 'Absent',  activeClass: 'border-danger bg-danger-bg text-danger' },
  { value: 'late',    label: 'Late',    activeClass: 'border-warning bg-warning-bg text-warning' },
  { value: 'excused', label: 'Excused', activeClass: 'border-gray-400 bg-gray-100 text-gray-700' },
]

function nowTimeInputValue() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Arrival time only accompanies a present/late mark; absent/excused leave the
// backend to null check_in_time.
function timeToIso(timeHHmm: string): string {
  const [h, m] = timeHHmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h || 0, m || 0, 0, 0)
  return d.toISOString()
}

interface PickedStudent {
  id:   string
  name: string
}

export default function ManualMarkModal({ title = 'Mark Attendance', onClose, onMarked }: ManualMarkModalProps) {
  // Active students, fetched once when the modal opens (the picker matches
  // client-side). Licence-only enrolments never take driving lessons, so they're
  // dropped — the same rule the scheduling assign picker uses.
  const { data, loading: studentsLoading } = useApiResource(() => listStudents({ status: 'active', limit: 100 }))

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<PickedStudent | null>(null)
  const [status, setStatus] = useState<ApiAttendanceStatus>('present')
  const [arrivalTime, setArrivalTime] = useState(nowTimeInputValue())
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '' || !data) return []
    return data.students
      .filter((s) => s.enrolment_type !== 'licence_only')
      .filter((s) =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.student_number.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [data, query])

  const recordsCheckIn = status === 'present' || status === 'late'

  const handleSave = async () => {
    if (!selected || saving) return
    setSaving(true)
    setError(null)
    try {
      await markAttendance({
        studentId:   selected.id,
        status,
        method:      'manual',
        checkInTime: recordsCheckIn ? timeToIso(arrivalTime) : undefined,
        notes:       notes.trim() || undefined,
      })
      onMarked()
      onClose()
    } catch (err) {
      setError((err as ApiError)?.message ?? 'Could not save. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full max-h-[90vh] overflow-y-auto scrollbar-hide p-5">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-4">{title}</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
              Student <span className="text-danger">*</span>
            </label>
            {selected ? (
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                <span className="text-[13.5px] font-medium text-gray-900">{selected.name}</span>
                <button type="button" onClick={() => setSelected(null)} className="text-[12px] text-brand-600 hover:text-brand-700">
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={studentsLoading ? 'Loading students…' : 'Search student name or number…'}
                  disabled={studentsLoading}
                  className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 disabled:bg-gray-50"
                />
                {results.length > 0 && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {results.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelected({ id: s.id, name: `${s.first_name} ${s.last_name}` })
                          setQuery('')
                        }}
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{s.first_name} {s.last_name}</p>
                        <p className="text-[11px] text-gray-500">{s.student_number}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
              Status <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`px-3 py-2 rounded-lg text-[12.5px] font-medium border-2 transition-colors ${
                    status === opt.value ? opt.activeClass : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {recordsCheckIn && (
            <div>
              <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Arrival Time</label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
              />
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-[12.5px] text-danger bg-danger-bg rounded-lg px-3 py-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected || saving}
            onClick={handleSave}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
