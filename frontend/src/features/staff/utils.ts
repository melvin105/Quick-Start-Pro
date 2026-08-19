import type { StaffRole } from './types'

export function getInitials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export function firstName(name: string) {
  return name.split(' ')[0]
}

export function roleLabel(role: StaffRole) {
  return role === 'instructor' ? 'Driving Instructor' : 'Secretary'
}

export function formatAddedDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
