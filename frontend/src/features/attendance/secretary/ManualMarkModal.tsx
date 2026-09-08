import { useMemo, useState } from 'react'
import { Search, AlertCircle, ChevronDown } from 'lucide-react'
import { useApiResource } from '../../../lib/useApiResource'
import { listInstructors } from '../../staff/staffService'
import { markAttendance, type ApiAttendanceStatus } from '../shared/attendanceService'
import type { AttendanceRecord } from '../shared/types'
import type { ApiError } from '../../../lib/apiError'

interface ManualMarkModalProps {
  title?: string
  records: AttendanceRecord[]
  onClose: () => void
  // Called after a successful mark so the page can refetch the roster.
  onMarked: () => void
}

const STATUS_OPTIONS: { value: ApiAttendanceStatus; label: string; activeClass: string }[] = [
  { value: 'present', label: 'Present', activeClass: 'border-success bg-success-bg text-success' },
  { value: 'absent',  label: 'Absent',  activeClass: 'border-danger bg-danger-bg text-danger' },
]

function nowTimeInputValue() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Arrival time only accompanies a present mark; absent leaves the backend to
// null check_in_time.
function timeToIso(timeHHmm: string): string {
  const [h, m] = timeHHmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h || 0, m || 0, 0, 0)
  return d.toISOString()
}

export default function ManualMarkModal({
  title = 'Mark Attendance',
  records,
  onClose,
  onMarked,
}: ManualMarkModalProps) {
  // Instructors for the optional Driver dropdown. Only active ones can be
  // assigned; the field stays optional when the driver is not yet known.
  const { data: instructorData } = useApiResource(() => listInstructors())
  const instructors = useMemo(
    () => (instructorData ?? []).filter((i) => i.status === 'active'),
    [instructorData],
  )

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<AttendanceRecord | null>(null)
  const [status, setStatus] = useState<ApiAttendanceStatus>('present')
  const [arrivalTime, setArrivalTime] = useState(nowTimeInputValue())
  const [driverId, setDriverId] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return []
    return records
      .filter((record) =>
        record.studentName.toLowerCase().includes(q) ||
        record.studentNumber.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [query, records])

  // Present marks capture arrival time, remaining lessons and the driver; an
  // absent student has none of those.
  const recordsCheckIn = status === 'present'

  const handleSave = async () => {
    if (!selected || saving) return
    setSaving(true)
    setError(null)
    try {
      await markAttendance({
        studentId:   selected.studentId,
        slotId:      selected.slotId,
        status,
        method:      'manual',
        checkInTime: recordsCheckIn ? timeToIso(arrivalTime) : undefined,
        driverId:    recordsCheckIn && driverId ? driverId : undefined,
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
      <div className="relative bg-white rounded-2xl shadow-modal max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide p-5">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-4">{title}</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
              Student <span className="text-danger">*</span>
            </label>
            {selected ? (
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                <span className="text-[13.5px] font-medium text-gray-900">{selected.studentName}</span>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-[12px] text-brand-600 hover:text-brand-700"
                >
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
                  placeholder="Search today's scheduled students…"
                  className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 disabled:bg-gray-50"
                />
                {results.length > 0 && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {results.map((record) => (
                      <button
                        key={record.studentId}
                        type="button"
                        onClick={() => { setSelected(record); setQuery('') }}
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{record.studentName}</p>
                        <p className="text-[11px] text-gray-500">{record.studentNumber} · {record.slotLabel}</p>
                      </button>
                    ))}
                  </div>
                )}
                {query.trim() !== '' && results.length === 0 && (
                  <p className="mt-2 px-1 text-[11.5px] text-gray-500">
                    No matching student is scheduled today.
                  </p>
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
            <>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Arrival Time</label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Lessons Left</label>
                  {/* System-calculated, read-only context (not an editable field). */}
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700">
                    {selected ? selected.lessonsLeft : '—'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Driver</label>
                <div className="relative">
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-9 border border-gray-200 rounded-lg text-[13px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                  >
                    <option value="">Select instructor (optional)</option>
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </>
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
