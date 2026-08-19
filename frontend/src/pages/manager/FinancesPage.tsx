import { useMemo, useState } from 'react'
import StatCard from '../../components/ui/StatCard'
import PeriodControls from '../../features/finances/PeriodControls'
import PeriodBarChart from '../../features/finances/PeriodBarChart'
import DayByDayTable from '../../features/finances/DayByDayTable'
import IncomeTab from '../../features/finances/IncomeTab'
import ExpensesTab from '../../features/finances/ExpensesTab'
import { computePeriodRange, eachDateInRange, formatPeriodLabel, type PeriodKey, type PeriodRange } from '../../features/finances/period'
import { getFinances } from '../../features/finances/financeService'
import { expenseCategoryLabel } from '../../features/records/shared/recordsMappers'
import { useApiResource } from '../../lib/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

type TabKey = 'day-by-day' | 'income' | 'expenses'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'income',     label: 'Income' },
  { key: 'expenses',   label: 'Expenses' },
  { key: 'day-by-day', label: 'Day-by-Day' },
]

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function downloadCsv(filename: string, header: string[], lines: string[][]) {
  const csv = [header.join(','), ...lines.map((row) => row.map(csvEscape).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function FinancesPage() {
  const [tab, setTab] = useState<TabKey>('day-by-day')
  const [period, setPeriod] = useState<PeriodKey>('this-month')
  const [customRange, setCustomRange] = useState<PeriodRange>(() => computePeriodRange('this-month'))

  const range = period === 'custom' ? customRange : computePeriodRange(period)
  const { data, loading, error, refetch } = useApiResource(
    () => getFinances(range.from, range.to),
    [range.from, range.to],
  )

  const dailyTotals = useMemo(
    () => eachDateInRange(range).map((date) => {
      const day = data?.days.find((item) => item.date.slice(0, 10) === date)
      return { date, income: day?.income ?? 0, expense: day?.expenses ?? 0 }
    }),
    [range, data],
  )

  const periodIncome = data?.income ?? 0
  const periodExpense = data?.expenses ?? 0
  const netValue = data?.net ?? 0

  const handleApplyCustomRange = (r: PeriodRange) => {
    setCustomRange(r)
    setPeriod('custom')
  }

  const handleExport = () => {
    if (tab === 'income') {
      const rows = data?.incomeEntries ?? []
      downloadCsv('finances-income.csv', ['Date', 'Student', 'Description', 'Amount'],
        rows.map((r) => [r.date, r.student_name, r.package_name ?? `${r.method.replace('_', ' ')} payment`, String(r.amount)]))
    } else if (tab === 'expenses') {
      const rows = data?.expenseEntries ?? []
      downloadCsv('finances-expenses.csv', ['Date', 'Description', 'Category', 'Amount'],
        rows.map((e) => [e.date, e.description ?? expenseCategoryLabel(e.category), expenseCategoryLabel(e.category), String(e.amount)]))
    } else {
      downloadCsv('finances-day-by-day.csv', ['Date', 'Income', 'Expenses', 'Net'],
        dailyTotals.map((d) => [d.date, String(d.income), String(d.expense), String(d.income - d.expense)]))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Finances</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Finances</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Period: {formatPeriodLabel(range)}</p>
        </div>
        <PeriodControls
          period={period}
          onPeriodChange={setPeriod}
          customRange={customRange}
          onApplyCustomRange={handleApplyCustomRange}
          onExport={handleExport}
        />
      </div>

      {loading && <LoadingState message="Loading finances…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && data && <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Income" value={`GHS ${periodIncome.toLocaleString()}`} />
        <StatCard label="Expenses" value={`GHS ${periodExpense.toLocaleString()}`} />
        <StatCard label="Net" value={`GHS ${netValue.toLocaleString()}`} tone="positive" />
        <StatCard label="Outstanding" value={`GHS ${data.outstandingBalance.toLocaleString()}`} tone="warning" />
      </div>

      <PeriodBarChart daily={dailyTotals} range={range} />

      <div className="flex items-center gap-5 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`pb-3 text-[13.5px] font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'day-by-day' && <DayByDayTable range={range} days={data.days} closures={data.closures} />}
      {tab === 'income' && <IncomeTab rows={data.incomeEntries} />}
      {tab === 'expenses' && <ExpensesTab rows={data.expenseEntries} />}
      </>}
    </div>
  )
}
