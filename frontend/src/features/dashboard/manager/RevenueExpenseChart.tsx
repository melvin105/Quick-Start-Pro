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

const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
const REVENUE  = [12400, 13800, 15200, 16100, 17300, 18200]
const EXPENSES = [7200, 7600, 8100, 8400, 8900, 9580]

// Validated with the dataviz palette validator (light mode): passes lightness,
// chroma, and CVD-separation checks for a 2-series categorical pair. The
// contrast WARN on the orange is covered by the header legend + tooltip
// labels (both always visible, never color-alone).
const REVENUE_COLOR = '#4D78C8'
const EXPENSE_COLOR = '#F39C12'

const data = MONTHS.map((month, i) => ({
  month,
  revenue:  REVENUE[i],
  expenses: EXPENSES[i],
}))

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

export default function RevenueExpenseChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-[14.5px] font-semibold text-gray-900">Revenue vs Expenses</h2>
        <div className="flex items-center gap-3 text-[11.5px] text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: REVENUE_COLOR }} />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: EXPENSE_COLOR }} />
            Expenses
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="28%" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#E9ECEF" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#ADB5BD', fontSize: 11 }}
              dy={6}
            />
            <YAxis hide domain={[0, (max: number) => max * 1.05]} />
            <Tooltip content={ChartTooltip} cursor={{ fill: 'rgba(27,58,107,0.04)' }} />
            <Bar dataKey="revenue"  name="Revenue"  fill={REVENUE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={14} />
            <Bar dataKey="expenses" name="Expenses" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
