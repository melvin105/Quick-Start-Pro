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
import type { RevenuePoint } from '../dashboardPresenters'

// The dashboard payload (v_monthly_revenue) carries revenue only — no monthly
// expense series — so this shows a single honest series rather than inventing
// an expense line the backend can't source yet.
const REVENUE_COLOR = '#4D78C8'

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

interface MonthlyRevenueChartProps {
  data: RevenuePoint[]
}

export default function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-[14.5px] font-semibold text-gray-900">Monthly Revenue</h2>
        <span className="flex items-center gap-1.5 text-[11.5px] text-gray-600">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: REVENUE_COLOR }} />
          Revenue
        </span>
      </div>

      <div className="flex-1 min-h-[200px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-[13px] text-gray-500">No revenue recorded yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="28%" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
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
              <Bar dataKey="revenue" name="Revenue" fill={REVENUE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
