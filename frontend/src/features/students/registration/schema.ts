import { z } from 'zod'

export const detailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName:  z.string().min(1, 'Last name is required'),
  dob:       z.string().min(1, 'Date of birth is required'),
  gender:    z.enum(['male', 'female', 'other'], { error: 'Please select a gender' }),
  phone:     z.string().min(1, 'Phone number is required'),
  email:           z.string().optional(),
  address:         z.string().optional(),
  ghanaCardNumber: z.string().optional(),

  nokName:         z.string().min(1, 'Next of kin name is required'),
  nokRelationship: z.string().min(1, 'Relationship is required'),
  nokPhone:        z.string().min(1, 'Phone number is required'),
  nokAddress:      z.string().optional(),

  sameAsNok:      z.boolean(),
  ecName:         z.string().min(1, 'Contact name is required'),
  ecPhone:        z.string().min(1, 'Phone is required'),
  ecRelationship: z.string().min(1, 'Relationship is required'),

  enrolment:    z.enum(['Driving Only', 'Licence Only', 'Driving + Licence'], { error: 'Select an enrolment type' }),
  programme:    z.string().min(1, 'Select a programme'),
  assignedSlot: z.string().optional(),
  notes:        z.string().optional(),
})

export type DetailsFormValues = z.infer<typeof detailsSchema>

export const DETAILS_DEFAULTS: Partial<DetailsFormValues> = {
  firstName: '', lastName: '', dob: '', phone: '', email: '', address: '', ghanaCardNumber: '',
  nokName: '', nokRelationship: '', nokPhone: '', nokAddress: '',
  sameAsNok: false, ecName: '', ecPhone: '', ecRelationship: '',
  programme: '', assignedSlot: '', notes: '',
}
