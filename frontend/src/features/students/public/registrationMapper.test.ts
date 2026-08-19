import { describe, it, expect } from 'vitest'
import { toSubmitInput } from './registrationMapper'
import type { PublicRegistrationValues } from './registrationSchema'

const base: PublicRegistrationValues = {
  firstName: 'Kofi',
  lastName:  'Mensah',
  dob:       '2001-03-12',
  gender:    'male',
  phone:     '0240000000',
  email:        '',
  address:      '',
  passportPhoto: '',
  idCardType:   '',
  idCardNumber: '',
  nokName:         'Ama Mensah',
  nokRelationship: 'Mother',
  nokPhone:        '0247778888',
  nokEmail:        '',
  sameAsNok:       false,
  ecName:         'Ama Mensah',
  ecPhone:        '0247778888',
  ecRelationship: 'Mother',
}

describe('toSubmitInput', () => {
  it('nests next-of-kin and emergency-contact groups', () => {
    const input = toSubmitInput(base)
    expect(input.nextOfKin).toEqual({
      name: 'Ama Mensah', relationship: 'Mother', phone: '0247778888', email: undefined,
    })
    expect(input.emergencyContact).toEqual({
      name: 'Ama Mensah', phone: '0247778888', relationship: 'Mother',
    })
  })

  it('coerces empty optional fields to undefined (stored as NULL) and maps passportPhoto -> photo', () => {
    const input = toSubmitInput(base)
    expect(input.email).toBeUndefined()
    expect(input.address).toBeUndefined()
    expect(input.photo).toBeUndefined()
    expect(input.idCardType).toBeUndefined()
    expect(input.idCardNumber).toBeUndefined()
  })

  it('keeps and trims provided optional fields', () => {
    const input = toSubmitInput({
      ...base,
      email:        '  kofi@example.com  ',
      passportPhoto: 'photo.jpg',
      idCardType:   'Ghana Card',
      idCardNumber: 'GHA-123',
    })
    expect(input.email).toBe('kofi@example.com')
    expect(input.photo).toBe('photo.jpg')
    expect(input.idCardType).toBe('Ghana Card')
    expect(input.idCardNumber).toBe('GHA-123')
  })
})
