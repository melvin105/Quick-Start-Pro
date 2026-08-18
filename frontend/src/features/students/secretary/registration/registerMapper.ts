import type { DetailsFormValues } from './schema'
import type { CreateStudentInput } from '../../shared/studentService'
import type { PackageOption } from '../../../settings/packageMappers'
import { deriveEnrolment } from '../../../settings/enrolment'
import { enrolmentEnum } from '../../shared/studentMappers'
import { normalizePhone } from '../../shared/registrationFormats'

// Empty optional fields come off the form as '' — send them as undefined so the
// backend stores NULL rather than an empty string.
function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

// Build the POST /students body from the wizard form. Two backend-shape notes:
//   • the students table has no next-of-kin columns, so the collected NOK block
//     isn't sent — only the emergency contact, collapsed to one free-text line.
//   • enrolment type isn't picked directly: it's derived from the chosen
//     package's name and mapped to the backend enum (defaulting to the safest
//     option, which includes licence tracking, if a name ever doesn't map).
export function toCreateStudentInput(
  values: DetailsFormValues,
  packages: PackageOption[],
  confirmDifferentPerson = false,
): CreateStudentInput {
  const pkg = packages.find((p) => p.name === values.programme)
  const enrolmentType = enrolmentEnum(deriveEnrolment(values.programme)) ?? 'driving_and_licence'

  return {
    firstName:        values.firstName.trim(),
    lastName:         values.lastName.trim(),
    gender:           values.gender,
    dob:              values.dob,
    phone:            normalizePhone(values.phone),
    email:            optional(values.email),
    address:          optional(values.address),
    emergencyContact: `${values.ecName.trim()} (${values.ecRelationship.trim()}) — ${normalizePhone(values.ecPhone)}`,
    idCardType:       optional(values.idCardType),
    ghanaCardNo:      optional(values.idCardNumber),
    photoUrl:         optional(values.passportPhoto),
    enrolmentType,
    packageId:        pkg?.id,
    ...(confirmDifferentPerson ? { confirmDifferentPerson: true } : {}),
  }
}
