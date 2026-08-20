// Startup validation of the secrets and connection strings the app cannot
// safely run without. Called once when the server boots (see index.ts) so a
// missing or weak value fails loudly and immediately, instead of surfacing
// later as forgeable auth tokens (a blank/guessable JWT_SECRET lets anyone mint
// a `role: 'manager'` token) or a dead database connection.
//
// Kept as a plain function (not run on import) so that importing the app for
// tests doesn't require a fully-populated production environment.

// Minimum length for a secret used to sign JWTs. 32 chars ≈ 256 bits, matching
// the HS256 key size, so the signature can't be brute-forced.
const MIN_SECRET_LENGTH = 32;

interface Rule {
  name: string;
  // Required secrets fail startup when missing; recommended ones only warn.
  required: boolean;
  minLength?: number;
  // Shown in the error/warning to explain why the value matters.
  note?: string;
}

const RULES: Rule[] = [
  { name: 'JWT_SECRET', required: true, minLength: MIN_SECRET_LENGTH,
    note: 'signs every session token; a weak or missing value lets attackers forge manager sessions' },
  { name: 'DATABASE_URL', required: true,
    note: 'the Postgres/Supabase connection string' },
  // publicTokenService intentionally falls back to JWT_SECRET when this is
  // unset, so it is recommended rather than required — but a dedicated secret is
  // safer (a leak of one doesn't compromise the other).
  { name: 'PUBLIC_FLOW_SECRET', required: false, minLength: MIN_SECRET_LENGTH,
    note: 'signs the public QR registration/check-in links; falls back to JWT_SECRET if unset' },
];

/**
 * Validate required environment configuration. Throws with a combined, readable
 * message listing every problem (so the operator fixes them in one pass) when a
 * required value is missing or too short. Non-fatal issues are logged as
 * warnings. Pass a custom `env` in tests; defaults to `process.env`.
 */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of RULES) {
    const value = env[rule.name]?.trim();
    const bucket = rule.required ? errors : warnings;

    if (!value) {
      bucket.push(`${rule.name} is not set — ${rule.note}.`);
      continue;
    }
    if (rule.minLength && value.length < rule.minLength) {
      bucket.push(
        `${rule.name} is too short (${value.length} chars; needs at least ${rule.minLength}) — ${rule.note}.`,
      );
    }
  }

  for (const warning of warnings) {
    console.warn(`[env] warning: ${warning}`);
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n  - ${errors.join('\n  - ')}\n` +
      `Set these in backend/.env before starting the server.`,
    );
  }
}
