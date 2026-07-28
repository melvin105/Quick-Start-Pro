import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { DAYS, DAY_FULL, START_HOURS, formatRangeShort, slotKey, lessonTone } from '../shared/utils'
import { MOCK_STUDENTS } from '../shared/mockData'
import type { Day, SlotAssignment } from '../shared/types'

interface ManagerDayScheduleListProps {
  grid: Record<string, SlotAssignment[]>
  todayColumn: Day
  onSlotTap: (day: Day, hour: number) => void
}

export default function ManagerDayScheduleList({ grid, todayColumn, onSlotTap }: ManagerDayScheduleListProps) {
  const [openDay, setOpenDay] = useState<Day | null>(todayColumn)

  return (
    <div className="flex flex-col gap-3">
      {DAYS.map((day) => {
        const isOpen = openDay === day
        return (
          <div key={day} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenDay(isOpen ? null : day)}
              className={`w-full flex items-center justify-between px-4 py-3 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                day === todayColumn ? 'text-brand-600' : 'text-gray-700'
              }`}
            >
              {DAY_FULL[day]}
              {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 divide-y divide-gray-100">
                {START_HOURS.map((hour) => {
                  const key = slotKey(day, hour)
                  const assignments = grid[key] ?? []
                  const isEmpty = assignments.length === 0

                  if (isEmpty) {
                    return (
                      <div key={hour} className="flex items-center justify-between gap-3 px-4 py-3">
                        <span className="text-[12.5px] text-gray-500 w-16 shrink-0">{formatRangeShort(hour)}</span>
                        <span className="flex-1 text-right text-[12.5px] text-gray-400">Empty</span>
                      </div>
                    )
                  }

                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => onSlotTap(day, hour)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-[12.5px] text-gray-500 w-16 shrink-0">{formatRangeShort(hour)}</span>
                      <div className="flex-1 flex flex-col items-end gap-0.5 min-w-0">
                        {assignments.map((a) => {
                          const student = MOCK_STUDENTS.find((s) => s.id === a.studentId)
                          if (!student) return null
                          const tone = lessonTone(a.lessonsRemaining)
                          return (
                            <span
                              key={a.studentId}
                              className={`text-[12.5px] font-medium truncate flex items-center gap-1 ${
                                tone === 'amber' ? 'text-warning' : tone === 'grey' ? 'text-gray-400' : 'text-gray-900'
                              }`}
                            >
                              {tone === 'amber' && <AlertTriangle size={11} />}
                              {student.name}
                            </span>
                          )
                        })}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
