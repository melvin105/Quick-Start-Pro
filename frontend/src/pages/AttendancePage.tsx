import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Plus } from 'lucide-react'
import useAttendanceStore from '../features/attendance/store'
import AttendanceTable from '../features/attendance/AttendanceTable'
import AttendanceCardList from '../features/attendance/AttendanceCardList'
import UnscheduledArrivals from '../features/attendance/UnscheduledArrivals'
import QrCodePanel from '../features/attendance/QrCodePanel'
import ManualMarkModal from '../features/attendance/ManualMarkModal'
import { formatTodayLong } from '../features/attendance/utils'
import { ROUTES } from '../lib/constants'

const POLL_INTERVAL_MS = 30000
const PULSE_DURATION_MS = 1500

export default function AttendancePage() {
  const records = useAttendanceStore((s) => s.records)
  const simulateSelfCheckIn = useAttendanceStore((s) => s.simulateSelfCheckIn)
  const lastLiveUpdateAt = useAttendanceStore((s) => s.lastLiveUpdateAt)

  const [showQr, setShowQr] = useState(false)
  const [showManualMark, setShowManualMark] = useState(false)
  const [showWalkIn, setShowWalkIn] = useState(false)
  const [pulse, setPulse] = useState(false)

  // Stand-in for a real-time feed: poll for newly self-checked-in students.
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
  const unscheduled = records.filter((r) => !r.hasSlot)

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

      <UnscheduledArrivals records={unscheduled} onAddWalkIn={() => setShowWalkIn(true)} />

      {showQr && <QrCodePanel onClose={() => setShowQr(false)} />}
      {showManualMark && <ManualMarkModal onClose={() => setShowManualMark(false)} />}
      {showWalkIn && <ManualMarkModal title="Add Walk-In" onClose={() => setShowWalkIn(false)} />}
    </div>
  )
}
