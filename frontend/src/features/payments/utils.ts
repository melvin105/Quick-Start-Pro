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

// Fallback business name for contexts that don't have the school record on
// hand (e.g. the in-app payment drawer, which only carries the payment).
export const DEFAULT_SCHOOL_NAME = 'Quick Start Driving School'

// Matches the wording of the transactional SMS receipts the client wants to
// replicate (e.g. Hubtel's "Hi NAME. AMOUNT Cedis received by BUSINESS.
// Receipt <link>"): first name, amount, and a link back to the full receipt
// (which has its own Download PDF button — no separate attachment needed).
export function receiptSmsMessage(studentName: string, amount: number, schoolName: string, id: string) {
  const firstName = studentName.trim().split(' ')[0] || studentName
  return `Hi ${firstName}. ${amount.toFixed(2)} Cedis received by ${schoolName}. Receipt ${receiptShareUrl(id)}`
}

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

// iOS wants "&body=", every other sms: implementation (incl. Android) wants
// "?body=" — there's no query string before it to append to.
function smsBodySeparator() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?'
}

// Opens the device's own SMS composer pre-filled with the receipt message —
// works today with no account or setup. Sent from the staff member's own
// number, not a branded sender ID, and requires them to hit send themselves;
// swap this for a real gateway (e.g. Hubtel) once the client signs off, for
// automatic, branded delivery. Desktop has no sms: handler, so it falls back
// to copying the receipt link instead.
export async function shareReceiptViaSms(
  studentName: string,
  amount: number,
  schoolName: string,
  id: string,
): Promise<'sms' | 'copied'> {
  if (isMobileDevice()) {
    const message = receiptSmsMessage(studentName, amount, schoolName, id)
    window.location.href = `sms:${smsBodySeparator()}body=${encodeURIComponent(message)}`
    return 'sms'
  }
  await navigator.clipboard.writeText(receiptShareUrl(id))
  return 'copied'
}
