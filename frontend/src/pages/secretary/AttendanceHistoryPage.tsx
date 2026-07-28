import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import useAttendanceStore from '../../features/attendance/shared/store'
import { HISTORICAL_ATTENDANCE, INSTRUCTORS } from '../../features/attendance/shared/mockData'
import Dropdown from '../../features/attendance/shared/Dropdown'
import StatusBadge from '../../features/attendance/shared/StatusBadge'
import SourceBadge from '../../features/attendance/shared/SourceBadge'
import { formatDateDisplay } from '../../features/attendance/shared/utils'
import { ROUTES } from '../../lib/constants'

const STATUS_OPTIONS = [
  { value: '', label: 'Status' },
  { value: 'present', label: 'Present' },
  { value: 'absent',  label: 'Absent' },
  { value: 'late',    label: 'Late' },
]

const RANGE_OPTIONS = [
  { value: '7',   label: 'Last 7 days' },
  { value: '30',  label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

export default function AttendanceHistoryPage() {
  const todayRecords = useAttendanceStore((s) => s.records)
  const allRecords = useMemo(() => [...todayRecords, ...HISTORICAL_ATTENDANCE], [todayRecords])

  const [search, setSearch] = useState('')
  const [studentFilter, setStudentFilter] = useState('')
  const [driverFilter, setDriverFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [range, setRange] = useState('7')

  const studentOptions = useMemo(() => {
    const names = Array.from(new Set(allRecords.map((r) => r.studentName))).sort()
    return [{ value: '', label: 'Student' }, ...names.map((n) => ({ value: n, label: n }))]
  }, [allRecords])

  const driverOptions = [
    { value: '', label: 'Driver' },
    ...INSTRUCTORS.map((i) => ({ value: i.name, label: i.name })),
  ]

  const filtered = useMemo(() => {
    const cutoff = range === 'all' ? null : (() => {
      const d = new Date()
      d.setDate(d.getDate() - Number(range))
      return d
    })()
    const q = search.trim().toLowerCase()

    return allRecords
      .filter((r) => {
        if (cutoff && new Date(r.date) < cutoff) return false
        if (studentFilter && r.studentName !== studentFilter) return false
        if (driverFilter && r.driverName !== driverFilter) return false
        if (statusFilter && r.status !== statusFilter) return false
        if (q && !r.studentName.toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [allRecords, search, studentFilter, driverFilter, statusFilter, range])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-gray-500">Dashboard / Attendance / History</p>
          <Link to={ROUTES.ATTENDANCE} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
            <ArrowLeft size={14} /> Back to Today
          </Link>
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Attendance History</h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 text-[13.5px] bg-white border border-gray-200 rounded-lg placeholder:text-gray-500
              focus:outline-none focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/10 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Dropdown label="Student" value={studentFilter} options={studentOptions} onChange={setStudentFilter} />
          <Dropdown label="Driver" value={driverFilter} options={driverOptions} onChange={setDriverFilter} />
          <Dropdown label="Date Range" value={range} options={RANGE_OPTIONS} onChange={setRange} />
          <Dropdown label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Date', 'Student', 'Time', 'Driver', 'Lessons Left', 'Source', 'Status'].map((col) => (
                  <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{formatDateDisplay(r.date)}</td>
                  <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{r.studentName}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.checkInTime ?? '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.driverName ?? '—'}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{r.lessonsLeft}</td>
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
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-gray-500">No attendance records match your filters.</div>
        )}
      </div>

      <p className="text-[12.5px] text-gray-500">
        Showing {filtered.length} record{filtered.length === 1 ? '' : 's'}
      </p>
    </div>
  )
}
