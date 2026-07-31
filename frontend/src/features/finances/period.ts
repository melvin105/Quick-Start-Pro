export type PeriodKey = 'today' | 'this-month' | 'last-month' | 'last-3-months' | 'custom'

export interface PeriodRange {
  from: string
  to:   string
}

function toIso(d: Date) {
  return d.toISOString().slice(0, 10)
}

function todayDate() {
  return new Date()
}

export function computePeriodRange(period: PeriodKey, custom?: PeriodRange): PeriodRange {
  const today = todayDate()

  if (period === 'custom' && custom) return custom

  if (period === 'today') {
    return { from: toIso(today), to: toIso(today) }
  }

  if (period === 'last-month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)
    return { from: toIso(start), to: toIso(end) }
  }

  if (period === 'last-3-months') {
    const start = new Date(today.getFullYear(), today.getMonth() - 2, 1)
    return { from: toIso(start), to: toIso(today) }
  }

  // this-month
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  return { from: toIso(start), to: toIso(today) }
}

export function formatPeriodDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatPeriodLabel(range: PeriodRange) {
  return `${formatPeriodDate(range.from)} – ${formatPeriodDate(range.to)}`
}

export function daysBetween(range: PeriodRange): number {
  const from = new Date(range.from)
  const to = new Date(range.to)
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

// Every calendar-date string within [from, to] inclusive.
export function eachDateInRange(range: PeriodRange): string[] {
  const dates: string[] = []
  const cur = new Date(range.from)
  const end = new Date(range.to)
  while (cur <= end) {
    dates.push(toIso(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}
