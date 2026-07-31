import { z } from 'zod'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const detailsSchema = z.object({
  passportPhoto: z.string().optional(),

  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  dob:       z.string().min(1, 'Date of birth is required'),
  gender:    z.enum(['male', 'female'], { error: 'Please select a gender' }),
  phone:     z.string().min(1, 'Phone number is required'),
  email:           z.string().optional(),
  address:         z.string().optional(),
  idCardType:      z.string().optional(),
  idCardNumber:    z.string().optional(),

  nokName:         z.string().min(1, 'Next of kin name is required'),
  nokRelationship: z.string().min(1, 'Relationship is required'),
  nokPhone:        z.string().min(1, 'Phone number is required'),
  nokEmail:        z.string().optional().refine((v) => !v || EMAIL_RE.test(v), 'Enter a valid email address'),

  sameAsNok:      z.boolean(),
  ecName:         z.string().min(1, 'Contact name is required'),
  ecPhone:        z.string().min(1, 'Phone is required'),
  ecRelationship: z.string().min(1, 'Relationship is required'),

  programme: z.string().min(1, 'Select a package'),
  notes:     z.string().optional(),
})

export type DetailsFormValues = z.infer<typeof detailsSchema>

export const DETAILS_DEFAULTS: Partial<DetailsFormValues> = {
  passportPhoto: '',
  firstName: '', lastName: '', dob: '', phone: '', email: '', address: '', idCardType: '', idCardNumber: '',
  nokName: '', nokRelationship: '', nokPhone: '', nokEmail: '',
  sameAsNok: false, ecName: '', ecPhone: '', ecRelationship: '',
  programme: '', notes: '',
}
