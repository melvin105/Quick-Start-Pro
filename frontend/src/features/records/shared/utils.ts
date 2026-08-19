import type { DayRecord, ExpenseEntry, LedgerRow } from './types'
import type { PaymentRecord } from '../../payments/types'

export function formatDateWithWeekday(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

// "Wed 14 Jul"
export function formatDayShort(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' })
  const day = date.toLocaleDateString('en-GB', { day: '2-digit' })
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  return `${weekday} ${day} ${month}`
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

export function computeDayTotals(date: string, expenses: ExpenseEntry[], paymentRecords: PaymentLike[]) {
  const totalIncome = paymentRecords.filter((r) => r.date === date).reduce((sum, r) => sum + r.amount, 0)
  const totalExpense = expenses.filter((e) => e.date === date).reduce((sum, e) => sum + e.amount, 0)
  return { totalIncome, totalExpense }
}

export function buildLedgerRows(date: string, expenses: ExpenseEntry[], paymentRecords: PaymentRecord[]): LedgerRow[] {
  const incomeRows: LedgerRow[] = paymentRecords
    .filter((r) => r.date === date)
    .map((r) => ({
      id: r.id, time: r.time ?? '—', description: `${r.studentName} (payment)`, category: 'Income', type: 'income' as const, amount: r.amount,
    }))

  const expenseRows: LedgerRow[] = expenses
    .filter((e) => e.date === date)
    .map((e) => ({
      id: e.id, time: e.time, description: e.description, category: e.category, type: 'expense' as const, amount: e.amount,
    }))

  return [...incomeRows, ...expenseRows].sort((a, b) => a.time.localeCompare(b.time))
}
