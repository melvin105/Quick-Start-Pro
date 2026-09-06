import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import { getLiveReport, type LiveReportKind, type ReportRow } from './reportService'
import { REPORT_DEFINITIONS } from './reportDefinitions'
import { createReportFilename, exportReportCsv, exportReportPdf } from './reportExport'
import useAuthStore from '../auth/authStore'
import { useApiResource } from '../../lib/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import DatePicker from '../../components/ui/DatePicker'
import FilterDropdown from '../students/shared/FilterDropdown'
import { ROUTES } from '../../lib/constants'

const EMPTY_ROWS: ReportRow[] = []

function initialFrom() {
  const date = new Date()
  date.setDate(1)
  return date.toISOString().slice(0, 10)
}

interface ReportFilters {
  from: string
  to: string
  status: string
}

export default function LiveReportPage({ kind }: { kind: LiveReportKind }) {
  const initialFilters = useMemo<ReportFilters>(() => ({ from: initialFrom(), to: new Date().toISOString().slice(0, 10), status: '' }), [])
  const [draft, setDraft] = useState(initialFilters)
  const [filters, setFilters] = useState(initialFilters)
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const [exportError, setExportError] = useState('')
  const user = useAuthStore((state) => state.user)
  const definition = REPORT_DEFINITIONS[kind]
  const { data, loading, error, refetch } = useApiResource(
    () => getLiveReport(kind, filters.from, filters.to, filters.status),
    [kind, filters.from, filters.to, filters.status],
  )
  const rows = data ?? EMPTY_ROWS
  const summaryCards = useMemo(() => definition.summaries(rows), [definition, rows])
  const hasRows = rows.length > 0
  const exportDisabled = !hasRows || loading || exporting !== null
  const exportDisabledReason = !hasRows ? 'Generate a report with at least one record before exporting.' : undefined

  const generate = () => {
    if (!draft.from || !draft.to || draft.from > draft.to) return
    if (draft.from === filters.from && draft.to === filters.to && draft.status === filters.status) {
      void refetch()
      return
    }
    setFilters({ ...draft })
  }

  const runExport = async (format: 'csv' | 'pdf') => {
    if (exportDisabled) return
    setExporting(format)
    setExportError('')
    const filename = createReportFilename(definition.filename, filters.from, filters.to, format)
    try {
      if (format === 'csv') {
        await exportReportCsv(definition.columns, rows, filename)
      } else {
        const statusLabel = kind === 'licences' && filters.status
          ? `Status: ${filters.status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}`
          : undefined
        await exportReportPdf({
          title: definition.title,
          from: filters.from,
          to: filters.to,
          filterDescription: statusLabel,
          summaryCards,
          columns: definition.columns,
          rows,
          filename,
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
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Reports / {definition.title}</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{definition.title}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to={ROUTES.REPORTS} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
            <ArrowLeft size={14} /> Back to Reports
          </Link>
          <span title={exportDisabledReason}>
            <button type="button" onClick={() => void runExport('csv')} disabled={exportDisabled} className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-gray-50 transition-colors">
              {exporting === 'csv' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Export CSV
            </button>
          </span>
          <span title={exportDisabledReason}>
            <button type="button" onClick={() => void runExport('pdf')} disabled={exportDisabled} className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-brand-800 transition-colors">
              {exporting === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Export PDF
            </button>
          </span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[12px] font-medium text-gray-600 mb-1">From</label>
          <DatePicker value={draft.from} maxDate={draft.to} onChange={(value) => setDraft((current) => ({ ...current, from: value }))} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-600 mb-1">To</label>
          <DatePicker value={draft.to} minDate={draft.from} onChange={(value) => setDraft((current) => ({ ...current, to: value }))} />
        </div>
        {kind === 'licences' && (
          <div>
            <label className="block text-[12px] font-medium text-gray-600 mb-1">Status</label>
            <FilterDropdown
              label="All Statuses"
              value={draft.status}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'learner_pending', label: 'Learner Pending' },
                { value: 'awaiting', label: 'Awaiting Full Licence' },
                { value: 'issued', label: 'Full Licence Issued' },
              ]}
              onChange={(value) => setDraft((current) => ({ ...current, status: value }))}
            />
          </div>
        )}
        <button type="button" onClick={generate} disabled={!draft.from || !draft.to || draft.from > draft.to || loading} className="px-4 py-2 text-[13px] font-medium text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-40 rounded-lg transition-colors">
          Generate Report
        </button>
        <p className="ml-auto text-[12.5px] text-gray-500">{rows.length} record{rows.length === 1 ? '' : 's'}</p>
      </div>

      {exportError && <p role="alert" className="text-[12.5px] text-danger">{exportError}</p>}
      {loading && <LoadingState message={`Loading ${definition.title.toLowerCase()}…`} />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{card.label}</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto"><table className="w-full text-left">
              <thead><tr className="border-b border-gray-200">{definition.columns.map((column) => <th key={column.key} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{column.header}</th>)}</tr></thead>
              <tbody>{rows.map((row, index) => <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">{definition.columns.map((column) => <td key={column.key} className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{column.value(row)}</td>)}</tr>)}</tbody>
            </table></div>
            {rows.length === 0 && <div className="py-16 text-center text-[13px] text-gray-500">No records match the generated report filters.</div>}
          </div>
        </>
      )}
    </div>
  )
}
