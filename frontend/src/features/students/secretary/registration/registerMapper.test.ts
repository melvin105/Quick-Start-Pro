import { describe, it, expect } from 'vitest'
import { toCreateStudentInput } from './registerMapper'
import type { DetailsFormValues } from './schema'
import type { PackageOption } from '../../../settings/packageMappers'

const packages: PackageOption[] = [
  { id: 'pkg-dl', name: 'Driving + Licence', price: 3200 },
  { id: 'pkg-lo', name: 'Licence Only',      price: 1200 },
  { id: 'pkg-do', name: 'Driving Only',      price: 2000 },
]

const base: DetailsFormValues = {
  passportPhoto: '',
  firstName: 'Kofi', lastName: 'Mensah', dob: '2001-03-12', gender: 'male', phone: '0240000000',
  email: '', address: '', idCardType: '', idCardNumber: '',
  nokName: 'Ama Mensah', nokRelationship: 'Mother', nokPhone: '0247778888', nokEmail: '',
  sameAsNok: false, ecName: 'Ama Mensah', ecPhone: '0247778888', ecRelationship: 'Mother',
  programme: 'Driving + Licence', notes: '',
}

describe('toCreateStudentInput', () => {
  it('resolves packageId from the chosen package name and derives the enrolment enum', () => {
    expect(toCreateStudentInput({ ...base, programme: 'Driving + Licence' }, packages)).toMatchObject({
      packageId: 'pkg-dl', enrolmentType: 'driving_and_licence',
    })
    expect(toCreateStudentInput({ ...base, programme: 'Licence Only' }, packages)).toMatchObject({
      packageId: 'pkg-lo', enrolmentType: 'licence_only',
    })
    expect(toCreateStudentInput({ ...base, programme: 'Driving Only' }, packages)).toMatchObject({
      packageId: 'pkg-do', enrolmentType: 'driving_only',
    })
  })

  it('collapses the emergency contact to one free-text line and drops next-of-kin', () => {
    const input = toCreateStudentInput(base, packages)
    expect(input.emergencyContact).toBe('Ama Mensah (Mother) — 0247778888')
    expect(input).not.toHaveProperty('nextOfKin')
  })

  it('coerces empty optionals to undefined and maps id number -> ghanaCardNo, photo -> photoUrl', () => {
    const input = toCreateStudentInput(base, packages)
    expect(input.email).toBeUndefined()
    expect(input.address).toBeUndefined()
    expect(input.ghanaCardNo).toBeUndefined()
    expect(input.photoUrl).toBeUndefined()
  })

  it('keeps and trims provided optionals', () => {
    const input = toCreateStudentInput({
      ...base, email: '  kofi@example.com  ', idCardNumber: ' GHA-123 ', passportPhoto: 'photo.jpg',
    }, packages)
    expect(input.email).toBe('kofi@example.com')
    expect(input.ghanaCardNo).toBe('GHA-123')
    expect(input.photoUrl).toBe('photo.jpg')
  })

  it('omits confirmDifferentPerson by default and sets it true when resubmitting', () => {
    expect(toCreateStudentInput(base, packages)).not.toHaveProperty('confirmDifferentPerson')
    expect(toCreateStudentInput(base, packages, true).confirmDifferentPerson).toBe(true)
  })

  it('falls back to the safest enrolment when the package name is unknown', () => {
    const input = toCreateStudentInput({ ...base, programme: 'Weekend Special' }, packages)
    expect(input.packageId).toBeUndefined()
    expect(input.enrolmentType).toBe('driving_and_licence')
  })
})
