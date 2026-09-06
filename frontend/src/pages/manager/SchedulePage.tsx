import { useMemo, useState } from 'react'
import { useApiResource } from '../../lib/useApiResource'
import { listSlots } from '../../features/scheduling/shared/schedulingService'
import { toScheduleGrid } from '../../features/scheduling/shared/schedulingMappers'
import { useBreakpoint } from '../../features/scheduling/shared/useBreakpoint'
import { getTodayColumn, getTodayLabel, slotKey } from '../../features/scheduling/shared/utils'
import ManagerScheduleGrid from '../../features/scheduling/manager/ManagerScheduleGrid'
import ManagerDayScheduleList from '../../features/scheduling/manager/ManagerDayScheduleList'
import ManagerSlotDetailDrawer from '../../features/scheduling/manager/ManagerSlotDetailDrawer'
import ManagerSlotDetailBottomDrawer from '../../features/scheduling/manager/ManagerSlotDetailBottomDrawer'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import type { Day } from '../../features/scheduling/shared/types'

interface DetailTarget {
  day: Day
  hour: number
}

export default function SchedulePage() {
  const { data, loading, error, refetch } = useApiResource(listSlots)
  const breakpoint = useBreakpoint()
  const todayColumn = getTodayColumn()
  const todayLabel = getTodayLabel()

  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)

  const grid = useMemo(() => (data ? toScheduleGrid(data) : {}), [data])
  const detailAssignments = detailTarget
    ? (grid[slotKey(detailTarget.day, detailTarget.hour)]?.assignments ?? [])
    : []

  if (loading) return <LoadingState message="Loading schedule…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap shrink-0">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Schedule</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Weekly Schedule</h1>
        </div>
        <span className="text-[12.5px] font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">
          Today: {todayLabel}
        </span>
      </div>

      {/* Desktop / tablet grid — fills remaining height, scrolls internally with a sticky day header */}
      <div className="hidden md:block flex-1 min-h-0">
        <ManagerScheduleGrid
          grid={grid}
          todayColumn={todayColumn}
          onCellClick={(day, hour) => setDetailTarget({ day, hour })}
        />
      </div>

      {/* Mobile day list */}
      <div className="md:hidden">
        <ManagerDayScheduleList grid={grid} todayColumn={todayColumn} onSlotTap={(day, hour) => setDetailTarget({ day, hour })} />
      </div>

      {/* Read-only slot detail: desktop side drawer / tablet+mobile bottom sheet */}
      {detailTarget && breakpoint === 'desktop' && (
        <ManagerSlotDetailDrawer
          day={detailTarget.day}
          hour={detailTarget.hour}
          assignments={detailAssignments}
          onClose={() => setDetailTarget(null)}
        />
      )}
      {detailTarget && breakpoint !== 'desktop' && (
        <ManagerSlotDetailBottomDrawer
          day={detailTarget.day}
          hour={detailTarget.hour}
          assignments={detailAssignments}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  )
}
