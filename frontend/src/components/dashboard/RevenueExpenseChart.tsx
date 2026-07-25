const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
const REVENUE  = [12400, 13800, 15200, 16100, 17300, 18200]
const EXPENSES = [7200, 7600, 8100, 8400, 8900, 9580]

// Validated with the dataviz palette validator (light mode): passes lightness,
// chroma, and CVD-separation checks for a 2-series categorical pair.
const REVENUE_COLOR = '#4D78C8'
const EXPENSE_COLOR = '#F39C12'

const MAX = Math.max(...REVENUE, ...EXPENSES)

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

      <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 min-h-[180px]">
        {MONTHS.map((month, i) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full flex items-end justify-center gap-0.5 h-40">
              <div
                className="w-2.5 sm:w-3.5 rounded-t-[3px] transition-opacity group-hover:opacity-80"
                style={{ height: `${(REVENUE[i] / MAX) * 100}%`, backgroundColor: REVENUE_COLOR }}
                title={`Revenue, ${month}: GHS ${REVENUE[i].toLocaleString()}`}
              />
              <div
                className="w-2.5 sm:w-3.5 rounded-t-[3px] transition-opacity group-hover:opacity-80"
                style={{ height: `${(EXPENSES[i] / MAX) * 100}%`, backgroundColor: EXPENSE_COLOR }}
                title={`Expenses, ${month}: GHS ${EXPENSES[i].toLocaleString()}`}
              />
            </div>
            <span className="text-[11px] text-gray-500">{month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
