import { DAYS, START_HOURS, formatRangeShort, slotKey } from '../shared/utils'
import { isCellFull, type ScheduleGridData } from '../shared/schedulingMappers'
import StudentChip from '../secretary/StudentChip'
import type { Day } from '../shared/types'

interface ManagerScheduleGridProps {
  grid: ScheduleGridData
  todayColumn: Day
  onCellClick: (day: Day, hour: number) => void
}

export default function ManagerScheduleGrid({ grid, todayColumn, onCellClick }: ManagerScheduleGridProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[64px_repeat(6,1fr)] border-b border-gray-200 sticky top-0 z-10 bg-white">
            <div className="px-2 py-3" />
            {DAYS.map((day) => (
              <div
                key={day}
                className={`px-2 py-3 text-center text-[11.5px] font-semibold uppercase tracking-wide ${
                  day === todayColumn ? 'text-brand-600 bg-brand-50' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {START_HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[64px_repeat(6,1fr)] divide-x divide-gray-100 border-b border-gray-100 last:border-0"
            >
              <div className="px-2 py-2 flex items-start justify-end text-[11px] text-gray-400 whitespace-nowrap">
                {formatRangeShort(hour)}
              </div>
              {DAYS.map((day) => {
                const cell = grid[slotKey(day, hour)]
                const assignments = cell?.assignments ?? []

                // Empty slots are informational only — no hover state, no click.
                if (assignments.length === 0) {
                  return (
                    <div
                      key={day}
                      className="min-h-[72px] p-1.5 m-0.5 rounded-md border border-dashed border-gray-200 bg-gray-50"
                    />
                  )
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => onCellClick(day, hour)}
                    className={`min-h-[72px] p-1.5 flex flex-col gap-1 text-left transition-colors hover:bg-gray-50 ${
                      day === todayColumn ? 'bg-brand-50/30' : ''
                    }`}
                  >
                    {assignments.map((a) => (
                      <StudentChip key={a.studentId} name={a.name} assignment={a} />
                    ))}
                    {isCellFull(cell) && (
                      <span className="mt-auto text-[9.5px] font-medium text-gray-400 uppercase tracking-wide">Full</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
