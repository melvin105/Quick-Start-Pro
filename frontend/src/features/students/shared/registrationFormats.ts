import type { IdCardType } from './types'

export const ID_CARD_TYPES: IdCardType[] = ['Ghana Card', 'Voter ID', 'Passport', "Driver's Licence", 'Other']

export const RELATIONSHIP_OPTIONS = [
  'Mother', 'Father', 'Spouse', 'Sister', 'Brother', 'Daughter', 'Son',
  'Guardian', 'Relative', 'Friend', 'Employer', 'Other',
].map((value) => ({ value, label: value }))

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ')
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

export const PHONE_PATTERN = /^0\d{2} \d{3} \d{4}$/

export function formatIdNumber(type: string, value: string): string {
  if (type === 'Ghana Card') {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (!digits) return ''
    const body = digits.slice(0, 9)
    return `GHA-${body}${digits.length === 10 ? `-${digits.slice(9)}` : ''}`
  }
  if (type === 'Voter ID') return value.replace(/\D/g, '').slice(0, 10)
  if (type === 'Passport') return value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 9)
  if (type === "Driver's Licence") return value.replace(/[^a-z0-9-]/gi, '').toUpperCase().slice(0, 20)
  return value.slice(0, 30)
}

export function idNumberPlaceholder(type: string): string {
  if (type === 'Ghana Card') return 'GHA-123456789-0'
  if (type === 'Voter ID') return '10 digits'
  if (type === 'Passport') return 'e.g. G1234567'
  if (type === "Driver's Licence") return 'Licence number'
  return 'Identity number'
}

export function idNumberError(type: string | undefined, value: string | undefined): string | null {
  const number = value?.trim() ?? ''
  if (!type && !number) return null
  if (!type) return 'Select the card type'
  if (!number) return 'Identity number is required'
  if (type === 'Ghana Card' && !/^GHA-\d{9}-\d$/.test(number)) return 'Enter all 10 Ghana Card digits'
  if (type === 'Voter ID' && !/^\d{10}$/.test(number)) return 'Voter ID must contain exactly 10 digits'
  if (type === 'Passport' && !/^[A-Z0-9]{8,9}$/.test(number)) return 'Passport number must be 8–9 letters or digits'
  if (type === "Driver's Licence" && !/^[A-Z0-9-]{5,20}$/.test(number)) return 'Enter a valid driver’s licence number'
  if (type === 'Other' && number.length < 3) return 'Enter a valid identity number'
  return null
}
