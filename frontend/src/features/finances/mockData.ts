export interface MonthlyFinance {
  month:    string
  revenue:  number
  expenses: number
}

// Feeds both the Dashboard's finance stat cards and the Finances page
// (Overview KPIs + Revenue vs Expenses chart) so the two stay consistent.
export const MONTHLY_FINANCE: MonthlyFinance[] = [
  { month: 'Feb', revenue: 12400, expenses: 7200 },
  { month: 'Mar', revenue: 13800, expenses: 7600 },
  { month: 'Apr', revenue: 15200, expenses: 8100 },
  { month: 'May', revenue: 16100, expenses: 8400 },
  { month: 'Jun', revenue: 17300, expenses: 8900 },
  { month: 'Jul', revenue: 18200, expenses: 9560 },
]

export const CURRENT_MONTH  = MONTHLY_FINANCE[MONTHLY_FINANCE.length - 1]
export const PREVIOUS_MONTH = MONTHLY_FINANCE[MONTHLY_FINANCE.length - 2]

export function netProfit(m: MonthlyFinance) {
  return m.revenue - m.expenses
}

// "+12% vs last month" / "-3% vs last month"
export function pctDeltaLabel(current: number, previous: number) {
  if (previous === 0) return '—'
  const pct = Math.round(((current - previous) / previous) * 100)
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct}% vs last month`
}

export const OUTSTANDING = { amount: 5200, studentsOwing: 6 }
