import type { DayRecord, ExpenseEntry } from './types'

export function formatDateWithWeekday(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export function nowTime() {
  return new Date().toTimeString().slice(0, 5)
}

export function formatTimeAmPm(time: string) {
  const [hStr, mStr] = time.split(':')
  let h = parseInt(hStr, 10)
  const period = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${h}:${mStr}${period}`
}

interface PaymentLike {
  date:   string
  amount: number
}

// A day with no explicit record yet (e.g. it hasn't been opened/submitted)
// carries forward the previous tracked day's closing balance.
export function computeDay(
  date: string,
  days: DayRecord[],
  expenses: ExpenseEntry[],
  paymentRecords: PaymentLike[],
): DayRecord {
  const existing = days.find((d) => d.date === date)
  if (existing) return existing

  const prior = days
    .filter((d) => d.date < date)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  if (!prior) return { date, openingBalance: 0, status: 'open' }

  const priorIncome = paymentRecords.filter((r) => r.date === prior.date).reduce((sum, r) => sum + r.amount, 0)
  const priorExpense = expenses.filter((e) => e.date === prior.date).reduce((sum, e) => sum + e.amount, 0)
  const opening = prior.openingBalance + priorIncome - priorExpense
  return { date, openingBalance: opening, status: 'open' }
}
