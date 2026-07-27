import { useState } from 'react'
import useSchedulingStore from '../../features/scheduling/shared/store'
import { useBreakpoint } from '../../features/scheduling/secretary/useBreakpoint'
import { DAY_FULL, getTodayColumn, slotKey } from '../../features/scheduling/shared/utils'
import ScheduleGrid from '../../features/scheduling/shared/ScheduleGrid'
import DayScheduleList from '../../features/scheduling/secretary/DayScheduleList'
import AssignPopover from '../../features/scheduling/secretary/AssignPopover'
import AssignModal from '../../features/scheduling/secretary/AssignModal'
import SlotDetailDrawer from '../../features/scheduling/secretary/SlotDetailDrawer'
import SlotDetailBottomDrawer from '../../features/scheduling/secretary/SlotDetailBottomDrawer'
import MobileSlotSheet from '../../features/scheduling/secretary/MobileSlotSheet'
import type { Day } from '../../features/scheduling/shared/types'

interface AssignTarget {
  day: Day
  hour: number
  anchorRect?: DOMRect
}

interface DetailTarget {
  day: Day
  hour: number
}

const DEFAULT_LESSONS_REMAINING = 10

export default function SchedulingPage() {
  const grid = useSchedulingStore((s) => s.grid)
  const assign = useSchedulingStore((s) => s.assign)
  const clear = useSchedulingStore((s) => s.clear)
  const breakpoint = useBreakpoint()
  const todayColumn = getTodayColumn()

  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null)
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)

  const handleGridCellClick = (day: Day, hour: number, el: HTMLElement) => {
    const assignments = grid[slotKey(day, hour)] ?? []
    if (assignments.length === 0) {
      setAssignTarget({ day, hour, anchorRect: el.getBoundingClientRect() })
    } else {
      setDetailTarget({ day, hour })
    }
  }

  const handleAssign = (studentId: string) => {
    if (!assignTarget) return
    assign(assignTarget.day, assignTarget.hour, studentId, DEFAULT_LESSONS_REMAINING)
    setAssignTarget(null)
  }

  const handleMobileAssign = (studentId: string) => {
    if (!detailTarget) return
    assign(detailTarget.day, detailTarget.hour, studentId, DEFAULT_LESSONS_REMAINING)
  }

  const handleClear = (studentId: string) => {
    if (!detailTarget) return
    clear(detailTarget.day, detailTarget.hour, studentId)
  }

  const detailAssignments = detailTarget ? (grid[slotKey(detailTarget.day, detailTarget.hour)] ?? []) : []

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Scheduling</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Weekly Schedule</h1>
        </div>
        <span className="text-[12.5px] font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">
          Today: {DAY_FULL[todayColumn]}
        </span>
      </div>

      {/* Desktop / tablet grid — fills remaining height, scrolls internally with a sticky day header */}
      <div className="hidden md:block flex-1 min-h-0">
        <ScheduleGrid grid={grid} todayColumn={todayColumn} onCellClick={handleGridCellClick} />
      </div>

      {/* Mobile day list */}
      <div className="md:hidden">
        <DayScheduleList grid={grid} todayColumn={todayColumn} onSlotTap={(day, hour) => setDetailTarget({ day, hour })} />
      </div>

      {/* Assign overlay: desktop anchored popover / tablet centred modal */}
      {assignTarget && breakpoint === 'desktop' && (
        <AssignPopover
          day={assignTarget.day}
          hour={assignTarget.hour}
          anchorRect={assignTarget.anchorRect}
          excludeIds={(grid[slotKey(assignTarget.day, assignTarget.hour)] ?? []).map((a) => a.studentId)}
          onAssign={handleAssign}
          onClose={() => setAssignTarget(null)}
        />
      )}
      {assignTarget && breakpoint === 'tablet' && (
        <AssignModal
          day={assignTarget.day}
          hour={assignTarget.hour}
          excludeIds={(grid[slotKey(assignTarget.day, assignTarget.hour)] ?? []).map((a) => a.studentId)}
          onAssign={handleAssign}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {/* Detail overlay: desktop side drawer / tablet bottom drawer / mobile combined sheet */}
      {detailTarget && breakpoint === 'desktop' && (
        <SlotDetailDrawer
          day={detailTarget.day}
          hour={detailTarget.hour}
          assignments={detailAssignments}
          onClear={handleClear}
          onAssignAnother={() => {
            setAssignTarget({ day: detailTarget.day, hour: detailTarget.hour })
            setDetailTarget(null)
          }}
          onClose={() => setDetailTarget(null)}
        />
      )}
      {detailTarget && breakpoint === 'tablet' && (
        <SlotDetailBottomDrawer
          day={detailTarget.day}
          hour={detailTarget.hour}
          assignments={detailAssignments}
          onClear={handleClear}
          onAssignAnother={() => {
            setAssignTarget({ day: detailTarget.day, hour: detailTarget.hour })
            setDetailTarget(null)
          }}
          onClose={() => setDetailTarget(null)}
        />
      )}
      {detailTarget && breakpoint === 'mobile' && (
        <MobileSlotSheet
          day={detailTarget.day}
          hour={detailTarget.hour}
          assignments={detailAssignments}
          onAssign={handleMobileAssign}
          onRemove={handleClear}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  )
}
