import { Pool, PoolClient } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
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
