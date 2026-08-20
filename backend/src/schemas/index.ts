import { z } from 'zod';

// ─── Centralised request schemas ─────────────────────────────────────────────
// One place that describes the accepted shape of every sensitive write request.
// Wired at the route layer via validateBody(). The enum lists mirror the
// Postgres enums (and the copies inside the services); they change rarely and
// are duplicated here on purpose so the boundary can reject bad values without a
// database round-trip.
//
// Guiding rule: this guard must not reject anything the services currently
// accept. It only adds *safe* rejections — wrong types, unknown enum values, and
// malformed UUIDs (which would otherwise reach Postgres and surface as a 500).

// Enum values mirrored from the DB / services.
export const PAYMENT_METHODS = ['cash', 'momo', 'bank_transfer', 'cheque'] as const;
export const EXPENSE_CATEGORIES = [
  'fuel',
  'vehicle_maintenance',
  'salaries',
  'rent',
  'utilities',
  'dvla_fees',
  'stationery',
  'other',
] as const;
export const GENDERS = ['male', 'female'] as const;
export const ENROLMENT_TYPES = ['driving_only', 'licence_only', 'driving_and_licence'] as const;
export const STUDENT_STATUSES = ['active', 'completed', 'suspended', 'withdrawn', 'archived'] as const;

// An enum whose validation error reads like the services' hand-written messages.
// The field name is added by validateBody from the path, so the message stays
// just the "must be one of: …" clause.
function enumOf<T extends readonly [string, ...string[]]>(values: T) {
  return z.enum(values, { error: () => `must be one of: ${values.join(', ')}` });
}

// Money fields are coerced from strings so numeric values typed into a form
// input ("500") still work, matching the services' current tolerance — then
// required to be > 0, exactly as recordPayment / createExpense insist.
const amount = z.coerce.number().positive('must be greater than 0');

const uuidField = z.uuid('must be a valid UUID');
// Dates are validated for real by the DB's date columns; here we only require a
// string so the boundary doesn't diverge from current behaviour.
const optionalString = z.string().optional();

// ─── Auth ────────────────────────────────────────────────────────────────────
// Deliberately permissive: role is NOT restricted to a known set and the
// password has no length rule, so an unknown role or an empty password still
// reaches the service and returns the SAME generic 401 — never leaking which
// roles exist or whether a password was blank. This mirrors the old controller's
// `typeof === 'string'` check, just centralised.
export const loginBodySchema = z.object({
  role: z.string(),
  password: z.string(),
});

// ─── Payments ────────────────────────────────────────────────────────────────
export const createPaymentSchema = z.object({
  studentId: uuidField,
  amount,
  method: enumOf(PAYMENT_METHODS),
  paymentDate: optionalString,
  notes: optionalString,
});

// Updates constrain only the fields with real rules and pass everything else
// through — the service whitelists the columns it writes, so nothing is lost.
export const updatePaymentSchema = z
  .object({
    amount: amount.optional(),
    method: enumOf(PAYMENT_METHODS).optional(),
    paymentDate: optionalString,
    notes: optionalString,
  })
  .passthrough();

// ─── Expenses ────────────────────────────────────────────────────────────────
export const createExpenseSchema = z.object({
  category: enumOf(EXPENSE_CATEGORIES),
  amount,
  description: optionalString,
  expenseDate: optionalString,
  vehicleId: uuidField.optional(),
});

export const updateExpenseSchema = z
  .object({
    category: enumOf(EXPENSE_CATEGORIES).optional(),
    amount: amount.optional(),
    description: optionalString,
    expenseDate: optionalString,
    vehicleId: uuidField.nullable().optional(),
  })
  .passthrough();

// ─── Users (login accounts — manager/secretary only) ─────────────────────────
// Email format, role enum and password strength are enforced deeper in
// userService (assertRole / assertStrongPassword); here we just require the
// fields to be present non-empty strings and the optional staff link to be a
// UUID.
export const createUserSchema = z.object({
  email: z.string().min(1, 'is required'),
  role: z.string().min(1, 'is required'),
  password: z.string().min(1, 'is required'),
  staffId: uuidField.optional(),
});

export const updateUserSchema = z
  .object({
    email: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
    password: z.string().min(1).optional(),
    staffId: uuidField.nullable().optional(),
  })
  .passthrough();

// ─── Students ────────────────────────────────────────────────────────────────
export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'is required'),
  lastName: z.string().min(1, 'is required'),
  gender: enumOf(GENDERS),
  dob: z.string().min(1, 'is required'),
  phone: z.string().min(1, 'is required'),
  email: optionalString,
  address: optionalString,
  emergencyContact: optionalString,
  ghanaCardNo: optionalString,
  idCardType: optionalString,
  photoUrl: optionalString,
  enrolmentType: enumOf(ENROLMENT_TYPES),
  packageId: uuidField.optional(),
  confirmDifferentPerson: z.boolean().optional(),
});

// The student profile carries many optional fields (eye test, licence, exam,
// remarks …). We validate only the ones with enum/id rules and pass the rest
// through untouched, so no profile field is accidentally stripped on update.
export const updateStudentSchema = z
  .object({
    gender: enumOf(GENDERS).optional(),
    enrolmentType: enumOf(ENROLMENT_TYPES).optional(),
    status: enumOf(STUDENT_STATUSES).optional(),
    packageId: uuidField.optional(),
  })
  .passthrough();
