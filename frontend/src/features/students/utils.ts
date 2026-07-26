export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString()}`
}

export function studentProfilePath(id: string) {
  return `/students/${id}`
}

export function studentEditPath(id: string) {
  return `/students/${id}/edit`
}

export function studentLicencePath(id: string) {
  return `/students/${id}/licence`
}

export function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateShort(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}
