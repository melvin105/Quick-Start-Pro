import { describe, it, expect } from 'vitest'
import {
  enrolmentLabel,
  enrolmentEnum,
  displayStatus,
  toStudentListItem,
} from './studentMappers'
import type { ApiStudentListRow } from './studentService'

describe('enrolmentLabel', () => {
  it('maps each enum to its display label', () => {
    expect(enrolmentLabel('driving_and_licence')).toBe('Driving + Licence')
    expect(enrolmentLabel('licence_only')).toBe('Licence Only')
    expect(enrolmentLabel('driving_only')).toBe('Driving Only')
  })
})

describe('enrolmentEnum', () => {
  it('maps a display label back to its enum', () => {
    expect(enrolmentEnum('Driving + Licence')).toBe('driving_and_licence')
    expect(enrolmentEnum('Licence Only')).toBe('licence_only')
    expect(enrolmentEnum('Driving Only')).toBe('driving_only')
  })

  it('returns undefined for the empty (no filter) or an unknown label', () => {
    expect(enrolmentEnum('')).toBeUndefined()
    expect(enrolmentEnum('Nonsense')).toBeUndefined()
  })
})

describe('displayStatus', () => {
  it('shows outstanding whenever there is a balance, whatever the status', () => {
    expect(displayStatus({ status: 'active', balance: 500 })).toBe('outstanding')
    expect(displayStatus({ status: 'completed', balance: 1 })).toBe('outstanding')
  })

  it('shows completed for a finished programme with no balance', () => {
    expect(displayStatus({ status: 'completed', balance: 0 })).toBe('completed')
  })

  it('shows active for everything else with no balance', () => {
    expect(displayStatus({ status: 'active', balance: 0 })).toBe('active')
    expect(displayStatus({ status: 'suspended', balance: 0 })).toBe('active')
    expect(displayStatus({ status: 'archived', balance: 0 })).toBe('active')
  })
})

describe('toStudentListItem', () => {
  const row: ApiStudentListRow = {
    id:                'uuid-1',
    student_number:    'DP-2026-0001',
    first_name:        'John',
    last_name:         'Mensah',
    gender:            'male',
    phone:             '0240000000',
    email:             null,
    status:            'active',
    enrolment_type:    'driving_and_licence',
    registration_date: '2026-08-01',
    photo_url:         null,
    total_fees:        2000,
    total_paid:        1500,
    balance:           500,
    package_name:      'Standard',
  }

  it('keeps id (routing) separate from the displayed student number', () => {
    const item = toStudentListItem(row)
    expect(item.id).toBe('uuid-1')
    expect(item.studentNumber).toBe('DP-2026-0001')
  })

  it('joins the name, labels the enrolment, and derives the badge status', () => {
    const item = toStudentListItem(row)
    expect(item.name).toBe('John Mensah')
    expect(item.enrolment).toBe('Driving + Licence')
    expect(item.balance).toBe(500)
    expect(item.status).toBe('outstanding')
  })

  it('coerces a null photo to undefined', () => {
    expect(toStudentListItem(row).photo).toBeUndefined()
    expect(toStudentListItem({ ...row, photo_url: 'p.jpg' }).photo).toBe('p.jpg')
  })
})
