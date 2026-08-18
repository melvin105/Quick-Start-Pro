import { z } from 'zod'
import { detailsSchema } from '../registration/schema'

// The edit form reuses PersonalDetailsSection (typed to DetailsFormValues), so
// it keeps the same field shape. But PATCH /students/:id only persists the core
// identity/contact fields, the single emergency-contact line and enrolment type
// — it can't store next-of-kin, the package linkage or notes. Those fields
// aren't rendered on the edit form, so they're relaxed to optional here (they
// stay in the type, defaulting to ''), leaving only the editable, persisted
// fields required. The inferred type stays identical to DetailsFormValues.
export const editSchema = detailsSchema.extend({
  nokName:         z.string().optional().default(''),
  nokRelationship: z.string().optional().default(''),
  nokPhone:        z.string().optional().default(''),
  ecPhone:         z.string().optional().default(''),
  ecRelationship:  z.string().optional().default(''),
  programme:       z.string().optional().default(''),
})
