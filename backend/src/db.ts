import { Pool, PoolClient } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { ConnectionOptions } from 'tls';

// ─── Database TLS ─────────────────────────────────────────────────────────────
// The connection to Supabase must be encrypted AND authenticated. Encryption
// alone (rejectUnauthorized: false) still lets a man-in-the-middle present its
// own certificate and read/alter every query. So by default we VERIFY the
// server's certificate.
//
// Verification modes, strongest first:
//   1. Pinned CA — the connection is trusted only if signed by that exact CA,
//      immune even to a compromised system trust store. Sources, in order:
//        a. SUPABASE_DB_CA_CERT_PATH — path to a CA file (highest priority),
//        b. SUPABASE_DB_CA_CERT     — inline PEM (e.g. from a secret manager),
//        c. the bundled certs/supabase-ca.crt — Supabase's public "Root 2021 CA".
//           This ships with the repo so verification works out of the box for the
//           whole team with no env setup. Supabase's pooler does NOT chain to a
//           browser-trusted root, so Node's system store alone can't verify it.
//   2. System trust store — used only if no CA is available (the bundled file was
//      removed and no env override is set): verified against Node's built-in CAs.
//
// Escape hatch: DB_SSL_REJECT_UNAUTHORIZED=false restores the old unverified
// behaviour (encrypted but unauthenticated). It logs a loud warning and must
// never be used in production — it exists only for a constrained local box that
// can't present the CA. DB_SSL=disable turns TLS off entirely (local plain PG).
//
// Exported and pure over (env, bundledCaPath) so the decision logic can be
// unit-tested without a database — pass bundledCaPath=null to exercise the
// "no CA at all" path.
const BUNDLED_CA_PATH = join(__dirname, '..', 'certs', 'supabase-ca.crt');

export function resolveDbSsl(
  env: NodeJS.ProcessEnv = process.env,
  bundledCaPath: string | null = BUNDLED_CA_PATH,
): ConnectionOptions | false {
  if (env.DB_SSL === 'disable') return false;

  const rejectUnauthorized = env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

  let ca: string | undefined;
  if (env.SUPABASE_DB_CA_CERT_PATH) {
    // An explicit path is a deliberate choice — fail loudly if it's wrong rather
    // than silently downgrading to a weaker trust source.
    try {
      ca = readFileSync(env.SUPABASE_DB_CA_CERT_PATH, 'utf8');
    } catch (err) {
      throw new Error(
        `Could not read SUPABASE_DB_CA_CERT_PATH (${env.SUPABASE_DB_CA_CERT_PATH}): ${(err as Error).message}`,
      );
    }
  } else if (env.SUPABASE_DB_CA_CERT) {
    // Allow the PEM to be supplied on one line with escaped newlines (common in
    // .env / secret managers) and normalise them back to real line breaks.
    ca = env.SUPABASE_DB_CA_CERT.replace(/\\n/g, '\n');
  } else if (bundledCaPath) {
    // Fall back to the CA that ships with the repo. If it's somehow missing we
    // don't crash — we drop to the system trust store and let TLS decide.
    try {
      ca = readFileSync(bundledCaPath, 'utf8');
    } catch {
      ca = undefined;
    }
  }

  if (!rejectUnauthorized) {
    console.warn(
      '[db] WARNING: database TLS certificate verification is DISABLED ' +
        '(DB_SSL_REJECT_UNAUTHORIZED=false). The connection is encrypted but NOT ' +
        'authenticated and is exposed to man-in-the-middle attacks. Do not use in production.',
    );
  }

  return { rejectUnauthorized, ...(ca ? { ca } : {}) };
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: resolveDbSsl(),
  // Cap concurrent server connections — we go through Supabase's Supavisor
  // pooler, which multiplexes, so a small pool per instance is plenty.
  max: 10,
  // Return idle clients to the pooler after 30s instead of holding them open.
  idleTimeoutMillis: 30_000,
  // Fail fast if a connection can't be acquired (pooler saturated / network
  // stall) rather than hanging forever; the frontend's own request timeout is
  // 10s, so anything longer is already a lost request server-side.
  connectionTimeoutMillis: 10_000,
  // Keep the TCP socket warm so idle connections aren't silently torn down
  // (which otherwise adds a fresh TLS handshake to the next query).
  keepAlive: true,
});

// Supavisor closes idle server connections on its own schedule. When it drops a
// connection this pool is still holding, node-postgres emits an 'error' event on
// the pool — and an unhandled 'error' on an EventEmitter is a fatal uncaught
// exception that crashes the whole process. This listener keeps the crash from
// happening: the dead client is discarded and the next request gets a fresh one.
pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

// Runs fn inside a transaction with app.current_user_id set as a
// transaction-local GUC, so DB-side triggers (audit_changes, etc.) can
// attribute the write. Needed because we connect via a plain pg pool with
// our own JWT auth, not Supabase Auth, so auth.uid() is always NULL here.
export async function withUserContext<T>(
  userId: string | null,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("select set_config('app.current_user_id', $1, true)", [userId ?? '']);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
