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

// Payments is a secretary-only feature — no role-prefixed variant needed.
export function paymentReceiptPath(id: string) {
  return `/secretary/payments/${id}/receipt`
}

// Public, unauthenticated route — safe to hand to anyone (no login required).
export function receiptShareUrl(id: string) {
  return `${window.location.origin}/receipt/${id}`
}

// Prefers the native share sheet where available, otherwise copies to clipboard.
export async function shareReceipt(id: string): Promise<'shared' | 'copied'> {
  const url = receiptShareUrl(id)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Payment Receipt', url })
      return 'shared'
    } catch {
      // user cancelled or the share sheet failed — fall back to clipboard
    }
  }
  await navigator.clipboard.writeText(url)
  return 'copied'
}
