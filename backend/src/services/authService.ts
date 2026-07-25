import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { pool } from '../db';
import { ApiError } from '../utils/ApiError';

const LOGIN_ROLES = ['manager', 'secretary'] as const;
type LoginRole = (typeof LOGIN_ROLES)[number];

interface LoginResult {
  token: string;
  role: LoginRole;
  staffId: string | null;
}

export async function login(role: string, password: string): Promise<LoginResult> {
  // Same generic error for "unknown role", "no account", and "wrong password" —
  // never tell an attacker which part was wrong.
  if (!(LOGIN_ROLES as readonly string[]).includes(role)) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid role or password.');
  }

  const { rows } = await pool.query(
    `select id, role, staff_id, password_hash
     from public.users
     where role = $1 and status = 'active'
     limit 1`,
    [role],
  );
  const user = rows[0];

  if (!user || !user.password_hash) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid role or password.');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid role or password.');
  }

  const jti = randomUUID();
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];
  const token = jwt.sign(
    { sub: user.id, role: user.role, staffId: user.staff_id, jti },
    process.env.JWT_SECRET as string,
    { expiresIn },
  );

  return { token, role: user.role, staffId: user.staff_id };
}

export async function logout(jti: string, exp: number): Promise<void> {
  await pool.query(
    `insert into public.revoked_tokens (jti, expires_at)
     values ($1, to_timestamp($2))
     on conflict (jti) do nothing`,
    [jti, exp],
  );
}

export async function isTokenRevoked(jti: string): Promise<boolean> {
  const { rows } = await pool.query(`select 1 from public.revoked_tokens where jti = $1`, [jti]);
  return rows.length > 0;
}
