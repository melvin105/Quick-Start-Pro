import type { PublicRegistrationValues } from './registrationSchema'
import type { SubmitRegistrationInput } from '../../registrations/registrationService'
import { normalizePhone } from '../shared/registrationFormats'

// Empty optional fields come off the form as '' — send them as undefined so the
// backend stores NULL rather than an empty string.
function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

// Flatten the flat react-hook-form values into the nested shape the
// registrations API expects (nextOfKin / emergencyContact groups).
export function toSubmitInput(values: PublicRegistrationValues): SubmitRegistrationInput {
  return {
    firstName:    values.firstName.trim(),
    lastName:     values.lastName.trim(),
    dob:          values.dob,
    gender:       values.gender,
    phone:        normalizePhone(values.phone),
    email:        optional(values.email),
    address:      optional(values.address),
    photo:        optional(values.passportPhoto),
    idCardType:   optional(values.idCardType),
    idCardNumber: optional(values.idCardNumber),
    nextOfKin: {
      name:         values.nokName.trim(),
      relationship: values.nokRelationship.trim(),
      phone:        normalizePhone(values.nokPhone),
      email:        optional(values.nokEmail),
    },
    emergencyContact: {
      name:         values.ecName.trim(),
      phone:        normalizePhone(values.ecPhone),
      relationship: values.ecRelationship.trim(),
    },
  }
}
