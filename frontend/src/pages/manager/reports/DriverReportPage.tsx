import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import FilterDropdown from '../../../features/students/shared/FilterDropdown'
import { computePeriodRange } from '../../../features/finances/period'
import { getDriverReport } from '../../../features/finances/financeService'
import DatePicker from '../../../components/ui/DatePicker'
import LoadingState from '../../../components/ui/LoadingState'
import ErrorState from '../../../components/ui/ErrorState'
import { useApiResource } from '../../../lib/useApiResource'
import { ROUTES } from '../../../lib/constants'
import useAuthStore from '../../../features/auth/authStore'
import type { DriverInstructorRow } from '../../../features/finances/financeService'
import { createReportFilename, exportReportCsv, exportReportPdf, type ReportColumn } from '../../../features/reports/reportExport'

const DRIVER_COLUMNS: ReportColumn<DriverInstructorRow>[] = [
  { key: 'instructor', header: 'Instructor', value: (row) => row.instructorName },
  { key: 'lessons', header: 'Lessons In Period', value: (row) => row.lessonsInPeriod },
  { key: 'average', header: 'Avg Per Week', value: (row) => row.avgPerWeek },
  { key: 'all_time', header: 'Total All Time', value: (row) => row.totalAllTime },
]

export default function DriverReportPage() {
  const defaultRange = computePeriodRange('this-month')
  const [fromDraft, setFromDraft] = useState(defaultRange.from)
  const [toDraft, setToDraft] = useState(defaultRange.to)
  const [instructorDraft, setInstructorDraft] = useState('')
  const [range, setRange] = useState(defaultRange)
  const [instructorFilter, setInstructorFilter] = useState('')
  const [breakdownInstructor, setBreakdownInstructor] = useState('')
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const [exportError, setExportError] = useState('')
  const user = useAuthStore((state) => state.user)

  const { data, loading, error, refetch } = useApiResource(
    () => getDriverReport(range.from, range.to),
    [range.from, range.to],
  )

  const instructors = data?.instructors ?? []
  const summaryRows = instructorFilter
    ? instructors.filter((row) => row.instructorId === instructorFilter)
    : instructors

  const summaryTotal = summaryRows.reduce((sum, r) => sum + r.lessonsInPeriod, 0)
  const summaryCards = [
    { label: 'Instructors', value: summaryRows.length },
    { label: 'Lessons In Period', value: summaryTotal },
    { label: 'Average Per Instructor', value: summaryRows.length ? Math.round((summaryTotal / summaryRows.length) * 10) / 10 : 0 },
  ]

  const selectedBreakdown = instructors.find((row) => row.instructorId === breakdownInstructor) ?? instructors[0]
  const breakdownRows = selectedBreakdown?.students ?? []
  const instructorOptions = [
    { value: '', label: 'All Instructors' },
    ...instructors.map((row) => ({ value: row.instructorId, label: row.instructorName })),
  ]
  const breakdownOptions = instructors.map((row) => ({ value: row.instructorId, label: row.instructorName }))

  const handleGenerate = () => {
    setRange({ from: fromDraft, to: toDraft })
    setInstructorFilter(instructorDraft)
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (summaryRows.length === 0 || exporting || loading) return
    setExporting(format)
    setExportError('')
    const filename = createReportFilename('driver', range.from, range.to, format)
    try {
      if (format === 'csv') {
        await exportReportCsv(DRIVER_COLUMNS, summaryRows, filename)
      } else {
        const instructorName = instructorFilter ? summaryRows[0]?.instructorName : undefined
        await exportReportPdf({
          title: 'Driver Report', from: range.from, to: range.to,
          filterDescription: instructorName ? `Instructor: ${instructorName}` : 'All Instructors',
          summaryCards, columns: DRIVER_COLUMNS, rows: summaryRows, filename,
          generatedBy: user?.name || 'Manager',
        })
      }
    } catch {
      setExportError(`The ${format.toUpperCase()} file could not be generated. Please try again.`)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Reports / Driver Report</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Driver Report</h1>
        </div>
        <Link to={ROUTES.REPORTS} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
          <ArrowLeft size={14} /> Back to Reports
        </Link>
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1">From</label>
          <DatePicker value={fromDraft} onChange={setFromDraft} maxDate={toDraft} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-700 mb-1">To</label>
          <DatePicker value={toDraft} onChange={setToDraft} minDate={fromDraft} />
        </div>
        <FilterDropdown label="All Instructors" value={instructorDraft} options={instructorOptions} onChange={setInstructorDraft} />
        <button
          type="button"
          onClick={handleGenerate}
          className="px-4 py-2 text-[13px] font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors sm:ml-auto"
        >
          Generate Report
        </button>
      </div>

      {loading && <LoadingState message="Loading driver report…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {exportError && <p role="alert" className="text-[12.5px] text-danger">{exportError}</p>}

      {!loading && !error && <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {summaryCards.map((card) => <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{card.value}</p>
        </div>)}
      </div>}

      {!loading && !error && <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {DRIVER_COLUMNS.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((r) => (
                <tr key={r.instructorId} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{r.instructorName}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{r.lessonsInPeriod}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.avgPerWeek}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.totalAllTime}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td className="px-4 py-3 text-[13px] font-semibold text-gray-900">Total</td>
                <td className="px-4 py-3 text-[13px] font-semibold text-gray-900 whitespace-nowrap">{summaryTotal}</td>
                <td className="px-4 py-3" colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>}

      {!loading && !error && <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[13.5px] font-semibold text-gray-900">Per-Student Breakdown</p>
          <FilterDropdown
            label="Instructor"
            value={selectedBreakdown?.instructorId ?? ''}
            options={breakdownOptions}
            onChange={setBreakdownInstructor}
          />
        </div>
        <p className="text-[12px] text-gray-500 -mt-1">Select an instructor to view the student breakdown.</p>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  {['Student', 'Lessons In Period', `Total With ${selectedBreakdown?.instructorName ?? 'Instructor'}`].map((col) => (
                    <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdownRows.map((r) => (
                  <tr key={r.studentId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{r.studentName}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{r.lessonsInPeriod}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{r.totalAllTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {breakdownRows.length === 0 && (
            <div className="py-10 text-center text-[13px] text-gray-500">No lessons recorded for this instructor.</div>
          )}
        </div>

      </div>}

      {!loading && !error && <div className="flex items-center gap-2">
        <span title={summaryRows.length === 0 ? 'Generate a report with at least one record before exporting.' : undefined}>
          <button
            type="button"
            onClick={() => void handleExport('csv')}
            disabled={summaryRows.length === 0 || exporting !== null || loading}
            className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-gray-50 transition-colors"
          >
            {exporting === 'csv' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Export CSV
          </button>
        </span>
        <span title={summaryRows.length === 0 ? 'Generate a report with at least one record before exporting.' : undefined}>
          <button
            type="button"
            onClick={() => void handleExport('pdf')}
            disabled={summaryRows.length === 0 || exporting !== null || loading}
            className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 border border-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-brand-800 transition-colors"
          >
            {exporting === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Export PDF
          </button>
        </span>
      </div>}
    </div>
  )
}
