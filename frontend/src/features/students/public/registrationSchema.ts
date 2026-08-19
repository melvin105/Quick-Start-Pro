import { z } from 'zod'
import { idNumberError, PHONE_PATTERN } from '../shared/registrationFormats'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Public self-registration only covers what the student themselves knows —
// personal details, next of kin, emergency contact. Enrolment/package
// selection stays with the secretary (Step 4), since it depends on pricing
// and programme decisions made at the desk.
export const publicRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  dob:       z.string().min(1, 'Date of birth is required'),
  gender:    z.enum(['male', 'female'], { error: 'Please select a gender' }),
  phone:     z.string().regex(PHONE_PATTERN, 'Enter a 10-digit Ghana phone number'),
  email:        z.string().optional(),
  address:      z.string().optional(),
  passportPhoto: z.string().optional(),
  idCardType:   z.string().optional(),
  idCardNumber: z.string().optional(),

  nokName:         z.string().min(1, 'Next of kin name is required'),
  nokRelationship: z.string().min(1, 'Relationship is required'),
  nokPhone:        z.string().regex(PHONE_PATTERN, 'Enter a 10-digit Ghana phone number'),
  nokEmail:        z.string().optional().refine((v) => !v || EMAIL_RE.test(v), 'Enter a valid email address'),

  sameAsNok:      z.boolean(),
  ecName:         z.string().min(1, 'Contact name is required'),
  ecPhone:        z.string().regex(PHONE_PATTERN, 'Enter a 10-digit Ghana phone number'),
  ecRelationship: z.string().min(1, 'Relationship is required'),
}).superRefine((values, context) => {
  const message = idNumberError(values.idCardType, values.idCardNumber)
  if (message) context.addIssue({ code: 'custom', path: ['idCardNumber'], message })
})

export type PublicRegistrationValues = z.infer<typeof publicRegistrationSchema>

export const PUBLIC_REGISTRATION_DEFAULTS: Partial<PublicRegistrationValues> = {
  firstName: '', lastName: '', dob: '', phone: '', email: '', address: '',
  passportPhoto: '',
  idCardType: '', idCardNumber: '',
  nokName: '', nokRelationship: '', nokPhone: '', nokEmail: '',
  sameAsNok: false, ecName: '', ecPhone: '', ecRelationship: '',
}
