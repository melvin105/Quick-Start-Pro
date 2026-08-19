import type { PaymentStatus } from './types'

const STYLES: Record<PaymentStatus, string> = {
  paid:    'bg-success-bg text-success',
  partial: 'bg-warning-bg text-warning',
}

const LABELS: Record<PaymentStatus, string> = {
  paid:    'Paid',
  partial: 'Partial',
}

export default function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
