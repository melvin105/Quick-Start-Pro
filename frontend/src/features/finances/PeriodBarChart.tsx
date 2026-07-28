import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { TooltipContentProps } from 'recharts/types/component/Tooltip'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { daysBetween, type PeriodRange } from './period'

const REVENUE_COLOR = '#4D78C8'
const EXPENSE_COLOR = '#F39C12'

export interface DailyTotal {
  date:    string
  income:  number
  expense: number
}

interface Bucket {
  key:     string
  label:   string
  income:  number
  expense: number
}

// Weekly buckets for short ranges (This Month / Last Month), monthly buckets
// once a range spans more than ~6 weeks (Last 3 Months / a wide custom range).
function bucketData(daily: DailyTotal[], range: PeriodRange): Bucket[] {
  const byMonth = daysBetween(range) > 45
  const buckets = new Map<string, Bucket>()
  const rangeStart = new Date(range.from)

  for (const d of daily) {
    const date = new Date(d.date)
    let key: string
    let label: string

    if (byMonth) {
      key = d.date.slice(0, 7)
      label = date.toLocaleDateString('en-GB', { month: 'short' })
    } else {
      const diffDays = Math.floor((date.getTime() - rangeStart.getTime()) / 86_400_000)
      const weekIndex = Math.floor(diffDays / 7)
      const weekStart = new Date(rangeStart)
      weekStart.setDate(weekStart.getDate() + weekIndex * 7)
      key = `w${weekIndex}`
      label = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    }

    const existing = buckets.get(key) ?? { key, label, income: 0, expense: 0 }
    existing.income += d.income
    existing.expense += d.expense
    buckets.set(key, existing)
  }

  return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key))
}

function formatGHS(value: number) {
  return `GHS ${value.toLocaleString()}`
}

function ChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-card px-3 py-2.5 text-[12px]">
      <p className="font-medium text-gray-900 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey as string} className="flex items-center gap-1.5 text-gray-600">
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-medium text-gray-900">{formatGHS(Number(entry.value))}</span>
        </p>
      ))}
    </div>
  )
}

interface PeriodBarChartProps {
  daily: DailyTotal[]
  range: PeriodRange
}

export default function PeriodBarChart({ daily, range }: PeriodBarChartProps) {
  const data = bucketData(daily, range)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="28%" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#E9ECEF" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#ADB5BD', fontSize: 11 }} dy={6} />
            <YAxis hide domain={[0, (max: number) => max * 1.05]} />
            <Tooltip content={ChartTooltip} cursor={{ fill: 'rgba(27,58,107,0.04)' }} />
            <Bar dataKey="income"  name="Income"  fill={REVENUE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={22} />
            <Bar dataKey="expense" name="Expenses" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 text-[11.5px] text-gray-600 mt-3 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: REVENUE_COLOR }} />
          Income
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: EXPENSE_COLOR }} />
          Expenses
        </span>
      </div>
    </div>
  )
}
