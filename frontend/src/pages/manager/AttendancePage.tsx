import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApiResource } from '../../lib/useApiResource'
import { listAttendance } from '../../features/attendance/shared/attendanceService'
import { toAttendanceRoster } from '../../features/attendance/shared/attendanceMappers'
import ManagerAttendanceTable from '../../features/attendance/manager/ManagerAttendanceTable'
import ManagerAttendanceCardList from '../../features/attendance/manager/ManagerAttendanceCardList'
import AttendanceSummaryRow from '../../features/attendance/manager/AttendanceSummaryRow'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import { formatTodayLong } from '../../features/attendance/shared/utils'
import { ROUTES } from '../../lib/constants'

const REFRESH_INTERVAL_MS = 30000

export default function AttendancePage() {
  const { data, loading, error, refetch } = useApiResource(
    listAttendance,
    [],
    { cacheKey: 'attendance:today', staleTime: REFRESH_INTERVAL_MS },
  )

  // Auto-refresh so the manager sees marks/check-ins the secretary makes without
  // a manual reload — the backend recomputes the roster on each call.
  useEffect(() => {
    const interval = setInterval(() => { void refetch() }, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refetch])

  const records = useMemo(() => (data ? toAttendanceRoster(data) : []), [data])

  if (loading) return <LoadingState message="Loading attendance…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const scheduled = records.filter((r) => r.hasSlot)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Attendance</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Today's Attendance</h1>
          <p className="text-[12.5px] text-gray-500 mt-0.5">{formatTodayLong()}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-1 text-[12px] font-medium text-gray-600">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live
          </div>
          <Link
            to={ROUTES.ATTENDANCE_HISTORY}
            className="px-3.5 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            History
          </Link>
        </div>
      </div>

      <AttendanceSummaryRow records={records} totalExpected={scheduled.length} />

      <ManagerAttendanceTable records={scheduled} />
      <ManagerAttendanceCardList records={scheduled} />
    </div>
  )
}
