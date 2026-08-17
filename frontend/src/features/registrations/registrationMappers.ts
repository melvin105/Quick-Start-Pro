import { format, isValid, parseISO } from 'date-fns'
import type { Registration } from './registrationService'

// UI shape for one row of the Pending queue. The service row is snake_case and
// carries more than the table shows; this narrows it to what the list renders.
export interface PendingItem {
  id:             string
  name:           string
  phone:          string
  submittedLabel: string
}

// 'YYYY-MM-DDTHH:mm:ssZ' -> 'd MMM yyyy' (e.g. '3 Aug 2026'); '' for a missing
// or unparseable timestamp so the cell degrades quietly instead of showing NaN.
export function formatSubmitted(iso: string | null): string {
  if (!iso) return ''
  const date = parseISO(iso)
  return isValid(date) ? format(date, 'd MMM yyyy') : ''
}

export function toPendingItem(reg: Registration): PendingItem {
  return {
    id:             reg.id,
    name:           `${reg.first_name} ${reg.last_name}`,
    phone:          reg.phone,
    submittedLabel: formatSubmitted(reg.submitted_at),
  }
}
