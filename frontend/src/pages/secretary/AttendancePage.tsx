import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Plus } from 'lucide-react'
import { useApiResource } from '../../lib/useApiResource'
import { listAttendance } from '../../features/attendance/shared/attendanceService'
import { toAttendanceRoster } from '../../features/attendance/shared/attendanceMappers'
import AttendanceTable from '../../features/attendance/shared/AttendanceTable'
import AttendanceCardList from '../../features/attendance/shared/AttendanceCardList'
import QrCodePanel from '../../features/attendance/secretary/QrCodePanel'
import ManualMarkModal from '../../features/attendance/secretary/ManualMarkModal'
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

  const [showQr, setShowQr] = useState(false)
  const [showManualMark, setShowManualMark] = useState(false)

  // Auto-refresh so marks made here, self check-ins, or another open session's
  // changes surface without a manual reload — the backend recomputes the whole
  // roster on each call.
  useEffect(() => {
    const interval = setInterval(() => { void refetch() }, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refetch])

  // The board shows students scheduled today; walk-ins (no slot) aren't surfaced
  // here, matching the previous behaviour.
  const scheduled = useMemo(
    () => (data ? toAttendanceRoster(data).filter((r) => r.hasSlot) : []),
    [data],
  )

  if (loading) return <LoadingState message="Loading attendance…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

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
          <button
            type="button"
            onClick={() => setShowQr(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Camera size={15} /> Show QR Code
          </button>
          <button
            type="button"
            onClick={() => setShowManualMark(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            <Plus size={15} /> Mark Manually
          </button>
        </div>
      </div>

      <AttendanceTable records={scheduled} />
      <AttendanceCardList records={scheduled} />

      {showQr && <QrCodePanel onClose={() => setShowQr(false)} />}
      {showManualMark && (
        <ManualMarkModal onClose={() => setShowManualMark(false)} onMarked={() => void refetch()} />
      )}
    </div>
  )
}
