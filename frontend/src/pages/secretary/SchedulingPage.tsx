import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { AlertCircle, Users } from 'lucide-react'
import { useApiResource } from '../../lib/useApiResource'
import { listSlots, assignStudent, moveStudent, unassignStudent } from '../../features/scheduling/shared/schedulingService'
import { toScheduleGrid } from '../../features/scheduling/shared/schedulingMappers'
import { useBreakpoint } from '../../features/scheduling/shared/useBreakpoint'
import { getTodayColumn, getTodayLabel, slotKey } from '../../features/scheduling/shared/utils'
import ScheduleGrid from '../../features/scheduling/shared/ScheduleGrid'
import DayScheduleList from '../../features/scheduling/secretary/DayScheduleList'
import AssignPopover from '../../features/scheduling/secretary/AssignPopover'
import AssignModal from '../../features/scheduling/secretary/AssignModal'
import SlotDetailDrawer from '../../features/scheduling/secretary/SlotDetailDrawer'
import SlotDetailBottomDrawer from '../../features/scheduling/secretary/SlotDetailBottomDrawer'
import MobileSlotSheet from '../../features/scheduling/secretary/MobileSlotSheet'
import DragAssignModal from '../../features/scheduling/secretary/DragAssignModal'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import type { ApiError } from '../../lib/apiError'
import type { Day } from '../../features/scheduling/shared/types'
import { ROUTES } from '../../lib/constants'

interface AssignTarget {
  day: Day
  hour: number
  anchorRect?: DOMRect
}

interface DetailTarget {
  day: Day
  hour: number
}

interface DragAssignTarget {
  day: Day
  hour: number
  studentId: string
  studentName: string
  fromDay: Day
  fromHour: number
}

export default function SchedulingPage() {
  const { data, loading, error, refetch } = useApiResource(listSlots)
  const breakpoint = useBreakpoint()
  const todayColumn = getTodayColumn()
  const todayLabel = getTodayLabel()

  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null)
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)
  const [dragAssignTarget, setDragAssignTarget] = useState<DragAssignTarget | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const grid = useMemo(() => (data ? toScheduleGrid(data) : {}), [data])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  const showActionError = (err: unknown) => {
    setActionError((err as ApiError)?.message ?? 'Something went wrong. Please try again.')
    setTimeout(() => setActionError(null), 3500)
  }

  // Mutations go straight through the service, then refetch the whole grid so the
  // denormalised lesson counts and every cell's occupancy stay in sync with the
  // server (the read hook stays the single source of truth for the board).
  const doAssign = async (day: Day, hour: number, studentId: string) => {
    const cell = grid[slotKey(day, hour)]
    if (!cell) return
    try {
      await assignStudent(cell.slotId, studentId)
      await refetch()
    } catch (err) {
      showActionError(err)
    }
  }

  const doUnassign = async (day: Day, hour: number, studentId: string) => {
    const cell = grid[slotKey(day, hour)]
    if (!cell) return
    try {
      await unassignStudent(cell.slotId, studentId)
      await refetch()
    } catch (err) {
      showActionError(err)
    }
  }

  // The backend moves both assignments in one transaction. That preserves a
  // same-day reschedule without ever leaving two active slots on that weekday.
  const doMove = async (fromDay: Day, fromHour: number, toDay: Day, toHour: number, studentId: string) => {
    const fromCell = grid[slotKey(fromDay, fromHour)]
    const toCell = grid[slotKey(toDay, toHour)]
    if (!fromCell || !toCell) return
    try {
      await moveStudent(fromCell.slotId, toCell.slotId, studentId)
      await refetch()
    } catch (err) {
      showActionError(err)
      await refetch()
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const overData = event.over?.data.current as { day: Day; hour: number } | undefined
    const activeData = event.active.data.current as { studentId: string; day: Day; hour: number } | undefined
    if (!overData || !activeData) return
    if (overData.day === activeData.day && overData.hour === activeData.hour) return
    const sourceCell = grid[slotKey(activeData.day, activeData.hour)]
    const studentName = sourceCell?.assignments.find((a) => a.studentId === activeData.studentId)?.name ?? ''
    setDragAssignTarget({
      day: overData.day,
      hour: overData.hour,
      studentId: activeData.studentId,
      studentName,
      fromDay: activeData.day,
      fromHour: activeData.hour,
    })
  }

  const handleGridCellClick = (day: Day, hour: number, el: HTMLElement) => {
    const assignments = grid[slotKey(day, hour)]?.assignments ?? []
    if (assignments.length === 0) {
      setAssignTarget({ day, hour, anchorRect: el.getBoundingClientRect() })
    } else {
      setDetailTarget({ day, hour })
    }
  }

  const handleAssign = (studentId: string) => {
    if (!assignTarget) return
    const { day, hour } = assignTarget
    setAssignTarget(null)
    void doAssign(day, hour, studentId)
  }

  const handleMobileAssign = (studentId: string) => {
    if (!detailTarget) return
    void doAssign(detailTarget.day, detailTarget.hour, studentId)
  }

  const handleClear = (studentId: string) => {
    if (!detailTarget) return
    void doUnassign(detailTarget.day, detailTarget.hour, studentId)
  }

  if (loading) return <LoadingState message="Loading schedule…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const assignCell = assignTarget ? grid[slotKey(assignTarget.day, assignTarget.hour)] : undefined
  const assignExcludeIds = assignCell?.assignments.map((a) => a.studentId) ?? []
  const assignCapacity = assignCell?.capacity ?? 0

  const detailCell = detailTarget ? grid[slotKey(detailTarget.day, detailTarget.hour)] : undefined
  const detailAssignments = detailCell?.assignments ?? []
  const detailCapacity = detailCell?.capacity ?? 0

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Scheduling</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Weekly Schedule</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={ROUTES.UNSCHEDULED_STUDENTS}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-brand-600 bg-white border border-brand-200 rounded-lg hover:bg-brand-50"
          >
            <Users size={14} />
            Unscheduled Driving Students ({data?.unscheduledStudents?.length ?? 0})
          </Link>
          <span className="text-[12.5px] font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">
            Today: {todayLabel}
          </span>
        </div>
      </div>

      {/* Desktop / tablet grid — fills remaining height, scrolls internally with a sticky day header */}
      <div className="hidden md:block flex-1 min-h-0">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <ScheduleGrid grid={grid} todayColumn={todayColumn} onCellClick={handleGridCellClick} />
        </DndContext>
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
          grid={grid}
          capacity={assignCapacity}
          anchorRect={assignTarget.anchorRect}
          excludeIds={assignExcludeIds}
          onAssign={handleAssign}
          onClose={() => setAssignTarget(null)}
        />
      )}
      {assignTarget && breakpoint === 'tablet' && (
        <AssignModal
          day={assignTarget.day}
          hour={assignTarget.hour}
          grid={grid}
          capacity={assignCapacity}
          excludeIds={assignExcludeIds}
          onAssign={handleAssign}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {/* Detail overlay: desktop side drawer / tablet bottom drawer / mobile combined sheet */}
      {detailTarget && breakpoint === 'desktop' && (
        <SlotDetailDrawer
          day={detailTarget.day}
          hour={detailTarget.hour}
          grid={grid}
          capacity={detailCapacity}
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
          grid={grid}
          capacity={detailCapacity}
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
          grid={grid}
          capacity={detailCapacity}
          assignments={detailAssignments}
          onAssign={handleMobileAssign}
          onRemove={handleClear}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {dragAssignTarget && (
        <DragAssignModal
          day={dragAssignTarget.day}
          hour={dragAssignTarget.hour}
          grid={grid}
          studentId={dragAssignTarget.studentId}
          studentName={dragAssignTarget.studentName}
          fromDay={dragAssignTarget.fromDay}
          fromHour={dragAssignTarget.fromHour}
          onConfirm={() => {
            const t = dragAssignTarget
            setDragAssignTarget(null)
            void doMove(t.fromDay, t.fromHour, t.day, t.hour, t.studentId)
          }}
          onCancel={() => setDragAssignTarget(null)}
        />
      )}

      {actionError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <AlertCircle size={15} className="text-danger" />
          {actionError}
        </div>
      )}
    </div>
  )
}
