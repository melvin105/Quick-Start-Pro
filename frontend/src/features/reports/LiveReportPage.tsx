import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { getLiveReport, type LiveReportKind, type ReportRow } from './reportService'
import { useApiResource } from '../../lib/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

const TITLES: Record<LiveReportKind, string> = {
  students: 'Student Reports', attendance: 'Attendance Reports', revenue: 'Revenue Reports',
  expenses: 'Expense Reports', schedule: 'Schedule Reports',
}

const EMPTY_ROWS: ReportRow[] = []

function initialFrom() {
  const date = new Date()
  date.setDate(1)
  return date.toISOString().slice(0, 10)
}

function labelFor(key: string) {
  return key.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function display(value: ReportRow[string], key: string) {
  if (value === null || value === undefined || value === '') return '—'
  if (key === 'amount' || key === 'total_revenue') return `GHS ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  return String(value)
}

export default function LiveReportPage({ kind }: { kind: LiveReportKind }) {
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const { data, loading, error, refetch } = useApiResource(() => getLiveReport(kind, from, to), [kind, from, to])
  const rows = data ?? EMPTY_ROWS
  const columns = useMemo(() => Array.from(new Set(rows.flatMap(Object.keys))), [rows])

  const exportCsv = () => {
    const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const csv = [columns.map(labelFor).map(quote).join(','), ...rows.map((row) => columns.map((key) => quote(row[key])).join(','))].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${kind}-report-${from}-${to}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><p className="text-[12px] text-gray-500">Dashboard / Reports</p><h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{TITLES[kind]}</h1></div>
        <button type="button" onClick={exportCsv} disabled={rows.length === 0} className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 disabled:opacity-40 rounded-lg"><Download size={15} /> Export CSV</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <label className="text-[12px] font-medium text-gray-600">From<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} className="block mt-1 px-3 py-2 border border-gray-200 rounded-lg text-[13px]" /></label>
        <label className="text-[12px] font-medium text-gray-600">To<input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} className="block mt-1 px-3 py-2 border border-gray-200 rounded-lg text-[13px]" /></label>
        <p className="ml-auto text-[12.5px] text-gray-500">{rows.length} record{rows.length === 1 ? '' : 's'}</p>
      </div>
      {loading && <LoadingState message={`Loading ${TITLES[kind].toLowerCase()}…`} />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left">
        <thead><tr className="border-b border-gray-200">{columns.map((key) => <th key={key} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{labelFor(key)}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">{columns.map((key) => <td key={key} className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{display(row[key], key)}</td>)}</tr>)}</tbody>
      </table></div>{rows.length === 0 && <div className="py-16 text-center text-[13px] text-gray-500">No records in this period.</div>}</div>}
    </div>
  )
}
