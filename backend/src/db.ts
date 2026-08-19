import { Pool, PoolClient } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
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
