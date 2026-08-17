import { describe, it, expect } from 'vitest'
import { toPendingItem, formatSubmitted } from './registrationMappers'
import type { Registration } from './registrationService'

const registration: Registration = {
  id:           'reg-1',
  first_name:   'Kofi',
  last_name:    'Mensah',
  phone:        '0240000000',
  email:        null,
  status:       'pending',
  student_id:   null,
  submitted_at: '2026-08-03T09:30:00Z',
  created_at:   '2026-08-03T09:30:00Z',
}

describe('formatSubmitted', () => {
  it('formats an ISO timestamp as a short date', () => {
    expect(formatSubmitted('2026-08-03T09:30:00Z')).toBe('3 Aug 2026')
  })

  it('returns an empty string for a missing or unparseable value', () => {
    expect(formatSubmitted(null)).toBe('')
    expect(formatSubmitted('not-a-date')).toBe('')
  })
})

describe('toPendingItem', () => {
  it('joins the name and carries the phone through', () => {
    const item = toPendingItem(registration)
    expect(item.id).toBe('reg-1')
    expect(item.name).toBe('Kofi Mensah')
    expect(item.phone).toBe('0240000000')
  })

  it('labels the submitted date', () => {
    expect(toPendingItem(registration).submittedLabel).toBe('3 Aug 2026')
  })
})
