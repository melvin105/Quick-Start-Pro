export function formatAuditTimestamp(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '')
  return `${date} · ${time}`
}

export const ACTION_TYPE_LABELS: Record<string, string> = {
  create:  'Created',
  edit:    'Edited',
  approve: 'Approved',
  flag:    'Flagged',
  login:   'Login',
}
