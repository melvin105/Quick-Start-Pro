import { ROUTES } from '../../../lib/constants'

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
  return ROUTES.STUDENT_PROFILE.replace(':id', id)
}

export function studentEditPath(id: string) {
  return ROUTES.STUDENT_EDIT.replace(':id', id)
}

export function studentLicencePath(id: string) {
  return ROUTES.STUDENT_LICENCE.replace(':id', id)
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
