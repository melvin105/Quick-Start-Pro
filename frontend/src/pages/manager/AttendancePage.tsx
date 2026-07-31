import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useAttendanceStore from '../../features/attendance/shared/store'
import ManagerAttendanceTable from '../../features/attendance/manager/ManagerAttendanceTable'
import ManagerAttendanceCardList from '../../features/attendance/manager/ManagerAttendanceCardList'
import AttendanceSummaryRow from '../../features/attendance/manager/AttendanceSummaryRow'
import { formatTodayLong } from '../../features/attendance/shared/utils'
import { ROUTES } from '../../lib/constants'

const POLL_INTERVAL_MS = 30000
const PULSE_DURATION_MS = 1500

export default function AttendancePage() {
  const records = useAttendanceStore((s) => s.records)
  const simulateSelfCheckIn = useAttendanceStore((s) => s.simulateSelfCheckIn)
  const lastLiveUpdateAt = useAttendanceStore((s) => s.lastLiveUpdateAt)

  const [pulse, setPulse] = useState(false)

  // Stand-in for a real-time feed: poll for newly self-checked-in students.
  // (The 60-minute no-show auto-absent sweep runs globally in AppShell.)
  useEffect(() => {
    const interval = setInterval(() => simulateSelfCheckIn(), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [simulateSelfCheckIn])

  useEffect(() => {
    if (lastLiveUpdateAt === null) return
    setPulse(true)
    const t = setTimeout(() => setPulse(false), PULSE_DURATION_MS)
    return () => clearTimeout(t)
  }, [lastLiveUpdateAt])

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
            <span
              className={`w-2 h-2 rounded-full bg-success animate-pulse transition-transform duration-300 ${pulse ? 'scale-150' : 'scale-100'}`}
            />
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
