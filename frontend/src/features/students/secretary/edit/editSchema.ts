import { z } from 'zod'
import { detailsSchema } from '../registration/schema'

// The edit form reuses PersonalDetailsSection (typed to DetailsFormValues), so
// it keeps the same field shape. But PATCH /students/:id only persists the core
// identity/contact fields, the single emergency-contact line and enrolment type
// — it can't store next-of-kin, the package linkage or notes. Those fields
// aren't rendered on the edit form, so their registration-only validation is
// relaxed here. The edit form's default values still provide empty strings;
// keeping these as strings also preserves the DetailsFormValues output type
// required by Zod 4's safeExtend assignability check.
// `.safeExtend` (not `.extend`) because detailsSchema ends in a `.superRefine`
// (the ID-number check). Zod v4 refuses `.extend()` on a refined object schema;
// `.safeExtend` overwrites these keys while preserving that refinement.
export const editSchema = detailsSchema.safeExtend({
  nokName:         z.string(),
  nokRelationship: z.string(),
  nokPhone:        z.string(),
  ecPhone:         z.string(),
  ecRelationship:  z.string(),
  programme:       z.string(),
})
