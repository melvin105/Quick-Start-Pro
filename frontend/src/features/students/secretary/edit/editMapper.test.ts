import { describe, it, expect } from 'vitest'
import { toEditFormValues, toUpdateStudentInput } from './editMapper'
import type { ApiStudentProfile } from '../../shared/studentService'
import type { DetailsFormValues } from '../registration/schema'

const profile: ApiStudentProfile = {
  id: 'uuid-1', student_number: 'DP-2026-0001', student_name: 'John Mensah',
  first_name: 'John', last_name: 'Mensah', dob: '2001-03-12', gender: 'male',
  status: 'active', enrolment_type: 'driving_and_licence',
  phone: '0241112233', email: 'john@example.com', address: 'East Legon',
  emergency_contact: 'Grace Mensah (Mother) — 0245557788',
  ghana_card_no: 'GHA-023456789-0', photo_url: null,
  registration_date: '2026-08-01', total_fees: 1500, total_paid: 500, balance: 1000,
  total_lessons: 12, lessons_used: 3, lessons_left: 9, package_name: 'Complete Driver',
  eye_test_done: null, eye_test_date: null, learner_licence_issued: null, learner_licence_date: null,
  exam_date: null, exam_result: null, licence_issued: null, licence_issued_date: null,
}

describe('toEditFormValues', () => {
  it('pre-fills the editable fields from the profile row', () => {
    const v = toEditFormValues(profile)
    expect(v).toMatchObject({
      firstName: 'John', lastName: 'Mensah', dob: '2001-03-12', gender: 'male',
      phone: '0241112233', email: 'john@example.com', address: 'East Legon',
      idCardNumber: 'GHA-023456789-0',
      ecName: 'Grace Mensah (Mother) — 0245557788',
    })
  })

  it('maps null optionals to empty strings and leaves unstored fields blank', () => {
    const v = toEditFormValues({ ...profile, email: null, address: null, photo_url: null, ghana_card_no: null })
    expect(v.email).toBe('')
    expect(v.address).toBe('')
    expect(v.passportPhoto).toBe('')
    expect(v.idCardNumber).toBe('')
    expect(v.nokName).toBe('')
    expect(v.programme).toBe('')
    expect(v.idCardType).toBe('')
  })

  it('narrows a non-female gender to male (the form only supports male/female)', () => {
    expect(toEditFormValues({ ...profile, gender: 'other' }).gender).toBe('male')
    expect(toEditFormValues({ ...profile, gender: 'female' }).gender).toBe('female')
  })
})

const base: DetailsFormValues = {
  passportPhoto: '', firstName: 'John', lastName: 'Mensah', dob: '2001-03-12', gender: 'male',
  phone: '0241112233', email: '', address: '', idCardType: '', idCardNumber: '',
  nokName: '', nokRelationship: '', nokPhone: '', nokEmail: '', sameAsNok: false,
  ecName: 'Grace Mensah — 0245557788', ecPhone: '', ecRelationship: '',
  programme: '', notes: '',
}

describe('toUpdateStudentInput', () => {
  it('builds the PATCH body with the given enrolment type and single emergency contact', () => {
    const input = toUpdateStudentInput(base, 'licence_only')
    expect(input).toMatchObject({
      firstName: 'John', lastName: 'Mensah', gender: 'male', dob: '2001-03-12',
      phone: '0241112233', emergencyContact: 'Grace Mensah — 0245557788', enrolmentType: 'licence_only',
    })
  })

  it('sends blank optionals as undefined so the PATCH leaves them unchanged', () => {
    const input = toUpdateStudentInput(base, 'driving_and_licence')
    expect(input.email).toBeUndefined()
    expect(input.address).toBeUndefined()
    expect(input.ghanaCardNo).toBeUndefined()
    expect(input.photoUrl).toBeUndefined()
  })

  it('trims and keeps provided optionals', () => {
    const input = toUpdateStudentInput({ ...base, email: '  a@b.com  ', idCardNumber: ' GHA-1 ' }, 'driving_only')
    expect(input.email).toBe('a@b.com')
    expect(input.ghanaCardNo).toBe('GHA-1')
  })
})
