import StatusBadge from '../../attendance/shared/StatusBadge'
import SourceBadge from '../../attendance/shared/SourceBadge'
import { formatDateDisplay } from '../../attendance/shared/utils'
import { getStudentAttendanceHistory } from '../../attendance/shared/attendanceService'
import { toStudentAttendanceRecord } from '../../attendance/shared/attendanceMappers'
import type { Student } from '../shared/types'
import { useApiResource } from '../../../lib/useApiResource'
import LoadingState from '../../../components/ui/LoadingState'
import ErrorState from '../../../components/ui/ErrorState'

const COLUMNS = ['Date', 'Slot', 'Check-in Time', 'Driver', 'Source', 'Status']

export default function StudentAttendanceTabContent({ student }: { student: Student }) {
  const { data, loading, error, refetch } = useApiResource(
    () => getStudentAttendanceHistory(student.id),
    [student.id],
  )

  if (loading) return <LoadingState message="Loading attendance history…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const records = data?.attendance.map(toStudentAttendanceRecord) ?? []

  if (records.length === 0) {
    return (
      <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
        No attendance records yet.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {COLUMNS.map((col) => (
                <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{formatDateDisplay(r.date)}</td>
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.slotLabel ?? '—'}</td>
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.checkInTime ?? '—'}</td>
                <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.driverName ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.source ? <SourceBadge source={r.source} /> : <span className="text-gray-400 text-[12px]">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.status ? <StatusBadge status={r.status} /> : <span className="text-gray-400 text-[12px]">Unmarked</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
