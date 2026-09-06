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
  refreshToken: string;
  user: AuthUser;
}

// A refreshed session — the frontend swaps its expired access token for a new
// pair without the user re-entering their password. Same shape minus `user`,
// which the frontend already holds.
interface RefreshResult {
  token: string;
  refreshToken: string;
}

// Short-lived access token used on every API call, and a long-lived refresh
// token used only to mint new access tokens. Splitting them limits the blast
// radius of a stolen access token to ACCESS_TTL, while the user still stays
// signed in for REFRESH_TTL via silent rotation.
const ACCESS_TTL = (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as SignOptions['expiresIn'];
const REFRESH_TTL = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];

// Protected pages commonly start several API reads together. Without a small
// cache, every one performs the same remote revoked-token lookup before its
// actual work. Five seconds is long enough to collapse a navigation burst but
// keeps cross-instance logout/revocation propagation tightly bounded.
const REVOCATION_CACHE_TTL_MS = 5_000;
const revocationCache = new Map<string, { revoked: boolean; expiresAt: number }>();
const revocationChecks = new Map<string, Promise<boolean>>();

function cacheRevocation(jti: string, revoked: boolean) {
  revocationCache.set(jti, {
    revoked,
    expiresAt: Date.now() + REVOCATION_CACHE_TTL_MS,
  });
}

// The identity we bake into a token. Kept minimal — the frontend gets the full
// user object from /auth/login and holds it; tokens only carry what the API
// needs to authorize a request.
interface TokenIdentity {
  id: string;
  role: LoginRole;
  staff_id: string | null;
}

interface RefreshPayload {
  sub: string;
  role: LoginRole;
  staffId: string | null;
  type: string;
  jti: string;
  exp: number;
}

// Mint a fresh access + refresh pair for a user. Each token carries its own
// `jti` (so either can be revoked independently) and a `type` claim that
// `authenticate` checks — a refresh token must never be accepted as an access
// token on a protected route, and vice versa (token-confusion defence).
function issueTokens(user: TokenIdentity): RefreshResult {
  const secret = process.env.JWT_SECRET as string;
  const base = { sub: user.id, role: user.role, staffId: user.staff_id };
  const accessJti = randomUUID();
  const refreshJti = randomUUID();

  const token = jwt.sign({ ...base, type: 'access', jti: accessJti }, secret, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign({ ...base, type: 'refresh', jti: refreshJti }, secret, { expiresIn: REFRESH_TTL });

  // These identifiers were minted in this process and cannot already be in
  // the revocation table. This removes the extra DB round trip immediately
  // after login/refresh while preserving the normal lookup after the TTL.
  cacheRevocation(accessJti, false);
  cacheRevocation(refreshJti, false);

  return { token, refreshToken };
}

// Record a token's jti as revoked until it would have expired anyway, so the
// revocation row can be cleaned up after `expires_at`. Shared by logout and
// refresh-token rotation.
async function revokeJti(jti: string, exp: number): Promise<void> {
  revocationCache.delete(jti);
  await pool.query(
    `insert into public.revoked_tokens (jti, expires_at)
     values ($1, to_timestamp($2))
     on conflict (jti) do nothing`,
    [jti, exp],
  );
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

  const { token, refreshToken } = issueTokens(user);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      staffId: user.staff_id,
    },
  };
}

// Exchange a valid refresh token for a brand-new access + refresh pair, with
// rotation: the presented refresh token is revoked, so each refresh token is
// single-use. If a revoked (already-rotated) refresh token is replayed, it's
// rejected here — the user is forced to sign in again. The generic error never
// reveals whether the token was expired, malformed, revoked, or belonged to a
// now-deactivated account.
export async function refresh(refreshToken: string): Promise<RefreshResult> {
  let payload: RefreshPayload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as RefreshPayload;
  } catch {
    throw new ApiError(401, 'INVALID_REFRESH', 'Your session has expired. Please sign in again.');
  }

  if (payload.type !== 'refresh' || (await isTokenRevoked(payload.jti))) {
    throw new ApiError(401, 'INVALID_REFRESH', 'Your session has expired. Please sign in again.');
  }

  // Re-read the account so a deactivated user (or a role change) can't keep
  // refreshing a live session on the strength of an old token alone.
  const { rows } = await pool.query(
    `select id, role, staff_id from public.users where id = $1 and status = 'active'`,
    [payload.sub],
  );
  if (rows.length === 0) {
    throw new ApiError(401, 'INVALID_REFRESH', 'Your session has expired. Please sign in again.');
  }

  // Rotate: burn the old refresh token before issuing the new pair.
  await revokeJti(payload.jti, payload.exp);
  return issueTokens(rows[0]);
}

// Sign out: revoke the current access token immediately, and — when the client
// sends it — the refresh token too, so a stolen refresh token can't be used to
// mint fresh sessions after the user logs out.
export async function logout(accessJti: string, accessExp: number, refreshToken?: string): Promise<void> {
  await revokeJti(accessJti, accessExp);

  if (!refreshToken) return;
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as RefreshPayload;
    if (payload.type === 'refresh') await revokeJti(payload.jti, payload.exp);
  } catch {
    // An invalid/expired refresh token has nothing to revoke — ignore it.
  }
}

export async function isTokenRevoked(jti: string): Promise<boolean> {
  const cached = revocationCache.get(jti);
  if (cached && cached.expiresAt > Date.now()) return cached.revoked;
  if (cached) revocationCache.delete(jti);

  const existingCheck = revocationChecks.get(jti);
  if (existingCheck) return existingCheck;

  const check = pool
    .query(`select 1 from public.revoked_tokens where jti = $1`, [jti])
    .then(({ rows }) => {
      const revoked = rows.length > 0;
      cacheRevocation(jti, revoked);
      return revoked;
    })
    .finally(() => revocationChecks.delete(jti));

  revocationChecks.set(jti, check);
  return check;
}
