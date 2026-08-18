import type { DetailsFormValues } from '../registration/schema'
import type { ApiStudentProfile, ApiEnrolmentType, UpdateStudentInput } from '../../shared/studentService'
import { formatIdNumber, formatPhoneInput, normalizePhone } from '../../shared/registrationFormats'

// Empty optional fields come off the form as '' — send them as undefined so the
// PATCH leaves the stored value untouched (the backend skips undefined fields).
function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

// Pre-fill the edit form from the live profile row. Fields the students table
// doesn't store (next-of-kin, package, notes, and the ID-card *type* — only the
// number is kept as ghana_card_no) are left blank; the form doesn't render
// them. The emergency contact is one free-text line on the backend, so it maps
// to the single ecName field the edit form shows.
export function toEditFormValues(p: ApiStudentProfile): DetailsFormValues {
  return {
    passportPhoto: p.photo_url ?? '',
    firstName:     p.first_name,
    lastName:      p.last_name,
    dob:           p.dob ?? '',
    gender:        p.gender === 'female' ? 'female' : 'male',
    phone:         formatPhoneInput(p.phone),
    email:         p.email ?? '',
    address:       p.address ?? '',
    idCardType:    p.id_card_type ?? (p.ghana_card_no ? 'Ghana Card' : ''),
    idCardNumber:  formatIdNumber(p.id_card_type ?? (p.ghana_card_no ? 'Ghana Card' : ''), p.ghana_card_no ?? ''),
    nokName: '', nokRelationship: '', nokPhone: '', nokEmail: '',
    sameAsNok: false,
    ecName:        p.emergency_contact ?? '',
    ecPhone: '', ecRelationship: '',
    programme: '', notes: '',
  }
}

// Build the PATCH /students/:id body. Enrolment type comes from the dedicated
// selector (not the package picker — package linkage isn't editable here). Blank
// optionals map to undefined, so this form can update a field but not clear one
// back to NULL; that's the safe default (no accidental data loss).
export function toUpdateStudentInput(
  values: DetailsFormValues,
  enrolmentType: ApiEnrolmentType,
): UpdateStudentInput {
  return {
    firstName:        values.firstName.trim(),
    lastName:         values.lastName.trim(),
    gender:           values.gender,
    dob:              values.dob,
    phone:            normalizePhone(values.phone),
    email:            optional(values.email),
    address:          optional(values.address),
    emergencyContact: optional(values.ecName),
    ghanaCardNo:      optional(values.idCardNumber),
    idCardType:       optional(values.idCardType),
    photoUrl:         optional(values.passportPhoto),
    enrolmentType,
  }
}
