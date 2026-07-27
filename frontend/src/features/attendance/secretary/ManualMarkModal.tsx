import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import useAttendanceStore from '../shared/store'
import useStudentsStore from '../../students/shared/store'
import { INSTRUCTORS } from '../shared/mockData'
import type { AttendanceStatus } from '../shared/types'

interface ManualMarkModalProps {
  title?: string
  onClose: () => void
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'absent',  label: 'Absent' },
  { value: 'late',    label: 'Late' },
]

function nowTimeInputValue() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function ManualMarkModal({ title = 'Mark Attendance', onClose }: ManualMarkModalProps) {
  const students = useStudentsStore((s) => s.students)
  const findTodayRecord = useAttendanceStore((s) => s.findTodayRecordByStudentId)
  const mark = useAttendanceStore((s) => s.mark)
  const addWalkIn = useAttendanceStore((s) => s.addWalkIn)

  const [query, setQuery] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [status, setStatus] = useState<AttendanceStatus>('present')
  const [arrivalTime, setArrivalTime] = useState(nowTimeInputValue())
  const [driver, setDriver] = useState('')
  const [lessonsLeft, setLessonsLeft] = useState(10)
  const [notes, setNotes] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q === '') return []
    return students
      .filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
      .slice(0, 6)
  }, [students, query])

  const selectedStudent = selectedStudentId ? students.find((s) => s.id === selectedStudentId) : undefined
  const suggestedLessons =
    selectedStudent?.lessonsPackageTotal != null && selectedStudent.lessonsTaken != null
      ? Math.max(selectedStudent.lessonsPackageTotal - selectedStudent.lessonsTaken, 0)
      : undefined

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id)
    setQuery('')
    const student = students.find((s) => s.id === id)
    if (student?.lessonsPackageTotal != null && student.lessonsTaken != null) {
      setLessonsLeft(Math.max(student.lessonsPackageTotal - student.lessonsTaken, 0))
    }
  }

  const handleSave = () => {
    if (!selectedStudent) return
    const existing = findTodayRecord(selectedStudent.id)
    const driverName = status !== 'absent' ? (driver || undefined) : undefined
    if (existing) {
      mark(existing.id, status, { driverName, lessonsLeft, checkInTime: arrivalTime, notes: notes || undefined })
    } else {
      addWalkIn({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        status,
        driverName,
        checkInTime: arrivalTime,
        lessonsLeft,
        notes: notes || undefined,
      })
    }
    onClose()
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
            {selectedStudent ? (
              <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                <span className="text-[13.5px] font-medium text-gray-900">{selectedStudent.name}</span>
                <button type="button" onClick={() => setSelectedStudentId(null)} className="text-[12px] text-brand-600 hover:text-brand-700">
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
                  placeholder="Search student name..."
                  className="w-full pl-8 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                />
                {results.length > 0 && (
                  <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                    {results.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectStudent(s.id)}
                        className="w-full text-left px-3 py-2 text-[13px] hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-[11px] text-gray-500">{s.id}</p>
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
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg text-[12.5px] font-medium border-2 transition-colors ${
                    status === opt.value
                      ? opt.value === 'present'
                        ? 'border-success bg-success-bg text-success'
                        : opt.value === 'absent'
                          ? 'border-danger bg-danger-bg text-danger'
                          : 'border-warning bg-warning-bg text-warning'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Arrival Time</label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Lessons Left</label>
              <input
                type="number"
                min={0}
                value={lessonsLeft}
                onChange={(e) => setLessonsLeft(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
              />
              {suggestedLessons !== undefined && (
                <p className="text-[11px] text-gray-400 mt-1">System calculated: {suggestedLessons}</p>
              )}
            </div>
          </div>

          {status !== 'absent' && (
            <div>
              <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Driver</label>
              <select
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
              >
                <option value="">Select instructor (optional)</option>
                {INSTRUCTORS.filter((i) => i.active).map((i) => (
                  <option key={i.id} value={i.name}>{i.name}</option>
                ))}
              </select>
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
            disabled={!selectedStudent}
            onClick={handleSave}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
