import { ApiError } from './ApiError';

// Centralised password strength policy, shared by every place that sets a
// password (admin user create/update, and the one-off manager-reset tool) so
// the rules can't drift between them.
//
// Deliberately modest but real: these are staff logins for a small driving
// school, not consumer accounts. We require a reasonable length and a mix of
// letters and digits, and reject a handful of obvious/guessable passwords
// (including app-specific ones). This layers on top of the login rate limit
// and per-IP lockout — strength makes each guess less likely to land; the
// throttles cap how many guesses an attacker gets.
export const MIN_PASSWORD_LENGTH = 10;

// Lower-cased blocklist of passwords too obvious to allow, whatever else they
// satisfy. Kept short and specific — this is a guard rail, not a full dictionary.
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
]);

// Returns a list of human-readable reasons the password fails the policy.
// Empty array => the password is acceptable. Pure and side-effect free so it's
// trivial to unit test and to reuse in a frontend check later.
export function passwordProblems(value: unknown): string[] {
  const problems: string[] = [];

  if (typeof value !== 'string') {
    return ['Password is required.'];
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    problems.push(`be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  if (!/[A-Za-z]/.test(value)) {
    problems.push('include at least one letter');
  }
  if (!/[0-9]/.test(value)) {
    problems.push('include at least one number');
  }
  if (BLOCKLIST.has(value.toLowerCase())) {
    problems.push('not be a commonly-used or easily-guessed password');
  }

  return problems;
}

// Throwing wrapper for the request path. Composes the failed requirements into
// one clear 400 so an admin sees everything to fix at once, e.g.
// "Password must be at least 10 characters long and include at least one number."
export function assertStrongPassword(value: unknown): asserts value is string {
  const problems = passwordProblems(value);
  if (problems.length > 0) {
    throw new ApiError(400, 'WEAK_PASSWORD', `Password must ${problems.join(' and ')}.`);
  }
}
