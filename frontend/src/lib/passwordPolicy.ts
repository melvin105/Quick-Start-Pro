// Frontend mirror of the backend password policy
// (backend/src/utils/passwordPolicy.ts). Kept deliberately identical so the
// live "requirements" checklist a user sees matches exactly what the API will
// accept — the backend remains the source of truth and the real gate; this is
// purely for helpful, instant feedback. If the backend rules change, change
// these to match (both have parity tests).

export const MIN_PASSWORD_LENGTH = 10

// Same lower-cased blocklist as the backend: passwords too obvious to allow,
// whatever else they satisfy.
const BLOCKLIST = new Set([
  'password',
  'password1',
  'password123',
  'passw0rd',
  'quickstart',
  'quickstart1',
  'quickstartpro',
  'drivingschool',
  '1234567890',
  'qwerty123',
  'admin123',
  'letmein123',
])

export interface PasswordRequirement {
  /** Stable key for React lists / tests. */
  key: 'length' | 'letter' | 'number' | 'notCommon'
  /** Human-readable label for the checklist. */
  label: string
  /** Whether the current value satisfies this requirement. */
  met: boolean
}

// Live checklist for the UI: one entry per rule, each with a met flag so the
// component can render a ✓ or ✗ as the user types. Order matches how they're
// introduced to the user (length → letter → number → not-common).
export function passwordRequirements(value: string): PasswordRequirement[] {
  return [
    { key: 'length', label: `At least ${MIN_PASSWORD_LENGTH} characters`, met: value.length >= MIN_PASSWORD_LENGTH },
    { key: 'letter', label: 'Contains a letter', met: /[A-Za-z]/.test(value) },
    { key: 'number', label: 'Contains a number', met: /[0-9]/.test(value) },
    { key: 'notCommon', label: 'Not a common or easily-guessed password', met: !BLOCKLIST.has(value.toLowerCase()) },
  ]
}

// True when every requirement is met. Mirrors the backend's
// `passwordProblems(value).length === 0`.
export function isPasswordValid(value: string): boolean {
  return passwordRequirements(value).every((r) => r.met)
}
