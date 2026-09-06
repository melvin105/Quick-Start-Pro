import { describe, expect, it } from 'vitest'
import { formatIdNumber, formatPhoneInput, idNumberError, normalizePhone } from './registrationFormats'

describe('registration input formats', () => {
  it('accepts digits only and formats a Ghana phone number', () => {
    expect(formatPhoneInput('024abc1234567')).toBe('024 123 4567')
    expect(normalizePhone('024 123 4567')).toBe('0241234567')
  })

  it('builds the official Ghana Card format from digits', () => {
    expect(formatIdNumber('Ghana Card', '1234567890')).toBe('GHA-123456789-0')
    expect(idNumberError('Ghana Card', 'GHA-123456789-0')).toBeNull()
  })

  it('keeps accepting digits while the Ghana Card prefix is displayed', () => {
    let displayed = ''
    for (const digit of '1234567890') {
      displayed = formatIdNumber('Ghana Card', displayed + digit)
    }
    expect(displayed).toBe('GHA-123456789-0')
  })

  it('restricts voter, passport and licence characters by type', () => {
    expect(formatIdNumber('Voter ID', '12a34567890')).toBe('1234567890')
    expect(formatIdNumber('Passport', 'g-1234567')).toBe('G1234567')
    expect(formatIdNumber("Driver's Licence", 'ab 12/$-34')).toBe('AB12-34')
  })

  it('rejects an incomplete identity number', () => {
    expect(idNumberError('Ghana Card', 'GHA-123')).toBe('Enter all 10 Ghana Card digits')
  })
})
