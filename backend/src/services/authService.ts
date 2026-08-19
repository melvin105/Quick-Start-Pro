import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { pool } from '../db';
import { ApiError } from '../utils/ApiError';

const LOGIN_ROLES = ['manager', 'secretary'] as const;
type LoginRole = (typeof LOGIN_ROLES)[number];

// The signed-in user returned to the frontend. This is the agreed login
// response contract — the frontend's authService `User` interface mirrors it.
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: LoginRole;
  staffId: string | null;
}

interface LoginResult {
  token: string;
  user: AuthUser;
}

export async function login(role: string, password: string): Promise<LoginResult> {
  // Same generic error for "unknown role", "no account", and "wrong password" —
  // never tell an attacker which part was wrong.
  if (!(LOGIN_ROLES as readonly string[]).includes(role)) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid role or password.');
  }

  // The login UX is role-only (no email/username field), and nothing in the
  // schema stops more than one active account from sharing a role — so we
  // can't just take the first active row for this role and check its hash;
  // we have to check the password against every active account for the role
  // and accept whichever one it actually matches.
  // Join staff so we can return a display name; fall back to the email's local
  // part if the account isn't linked to a staff record (or the name is blank).
  const { rows } = await pool.query(
    `select
       u.id,
       u.role,
       u.staff_id,
       u.email,
       u.password_hash,
       coalesce(nullif(trim(s.first_name || ' ' || s.last_name), ''), split_part(u.email, '@', 1)) as name
     from public.users u
     left join public.staff s on s.id = u.staff_id
     where u.role = $1 and u.status = 'active'`,
    [role],
  );

  let user: (typeof rows)[number] | undefined;
  for (const candidate of rows) {
    if (candidate.password_hash && (await bcrypt.compare(password, candidate.password_hash))) {
      user = candidate;
      break;
    }
  }

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid role or password.');
  }

  const jti = randomUUID();
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];
  const token = jwt.sign(
    { sub: user.id, role: user.role, staffId: user.staff_id, jti },
    process.env.JWT_SECRET as string,
    { expiresIn },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      staffId: user.staff_id,
    },
  };
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
