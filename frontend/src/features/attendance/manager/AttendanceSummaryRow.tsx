import type { AttendanceRecord } from '../shared/types'

interface AttendanceSummaryRowProps {
  records: AttendanceRecord[]
  totalExpected: number
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'success' | 'danger' | 'gray' }) {
  const toneClass = tone === 'success' ? 'text-success' : tone === 'danger' ? 'text-danger' : 'text-gray-900'
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[14.5px] font-semibold ${toneClass}`}>{value}</span>
      <span className="text-[12.5px] text-gray-500">{label}</span>
    </div>
  )
}

export default function AttendanceSummaryRow({ records, totalExpected }: AttendanceSummaryRowProps) {
  const present  = records.filter((r) => r.status === 'present').length
  const absent   = records.filter((r) => r.status === 'absent').length
  const unmarked = records.filter((r) => !r.status).length

  return (
    <div className="flex items-center gap-5 flex-wrap bg-white border border-gray-200 rounded-2xl px-4 py-3">
      <Stat label="Present" value={present} tone="success" />
      <Stat label="Absent" value={absent} tone="danger" />
      <Stat label="Unmarked" value={unmarked} tone="gray" />
      <Stat label="Total expected" value={totalExpected} tone="gray" />
    </div>
  )
}
