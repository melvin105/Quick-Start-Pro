export function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString()}`
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function formatDateDisplay(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export function formatDateLong(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function paymentReceiptPath(id: string) {
  return `/payments/${id}/receipt`
}
