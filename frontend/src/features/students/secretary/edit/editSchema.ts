import { z } from 'zod'
import { detailsSchema, refineIdNumber } from '../registration/schema'

// The edit form reuses PersonalDetailsSection (typed to DetailsFormValues), so
// it keeps the same field shape. But PATCH /students/:id only persists the core
// identity/contact fields, the single emergency-contact line and enrolment type
// — it can't store next-of-kin, the package linkage or notes. Those fields
// aren't rendered on the edit form, so they're relaxed to optional here (they
// stay in the type, defaulting to ''), leaving only the editable, persisted
// fields required. The inferred type stays identical to DetailsFormValues.
// Rebuilds the shape rather than `detailsSchema.safeExtend(...)` — Zod v4's
// safeExtend refuses to widen an already-required field to optional (by
// design, so a derived schema can't silently loosen a base invariant), which
// is exactly what these six fields need. Spreading the shape sidesteps that
// check; refineIdNumber (shared with detailsSchema) restores the one piece of
// validation that mattered from the original superRefine.
export const editSchema = z.object({
  ...detailsSchema.shape,
  nokName:         z.string().optional().default(''),
  nokRelationship: z.string().optional().default(''),
  nokPhone:        z.string().optional().default(''),
  ecPhone:         z.string().optional().default(''),
  ecRelationship:  z.string().optional().default(''),
  programme:       z.string().optional().default(''),
}).superRefine(refineIdNumber)
