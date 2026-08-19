import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DAYS, DAY_FULL, START_HOURS, formatRangeShort, slotKey } from '../shared/utils'
import { isCellFull, type ScheduleGridData } from '../shared/schedulingMappers'
import type { Day } from '../shared/types'

interface ManagerDayScheduleListProps {
  grid: ScheduleGridData
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
                  const cell = grid[slotKey(day, hour)]
                  const assignments = cell?.assignments ?? []

                  if (assignments.length === 0) {
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
                        {assignments.map((a) => (
                          <span key={a.studentId} className="text-[12.5px] font-medium text-gray-900 truncate">
                            {a.name}
                          </span>
                        ))}
                        {isCellFull(cell) && (
                          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Full</span>
                        )}
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
