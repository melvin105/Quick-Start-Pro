import bcrypt from 'bcryptjs';
import { pool, withUserContext } from '../db';
import { ApiError } from '../utils/ApiError';
import { assertStrongPassword } from '../utils/passwordPolicy';

// Only manager and secretary have login accounts — instructors are staff
// records with no login (see CLAUDE.md and the role-only login screen).
const LOGIN_ROLES = ['manager', 'secretary'] as const;
type LoginRole = (typeof LOGIN_ROLES)[number];

const ACCOUNT_STATUSES = ['active', 'inactive', 'suspended'] as const;

const BCRYPT_COST = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Never select password_hash — expose only whether one has been set, so the UI
// can flag "not yet provisioned" accounts without leaking the hash.
const USER_SELECT = `
  select id, email, role, staff_id, status, created_at, updated_at,
         (password_hash is not null) as has_password
  from public.users`;

export interface ActingUser {
  id: string;
  role: 'manager' | 'secretary';
}

export interface CreateUserInput {
  email: string;
  role: string;
  password: string;
  staffId?: string;
}

export interface UpdateUserInput {
  status?: string;
  role?: string;
  password?: string;
}

function assertRole(value: string): asserts value is LoginRole {
  if (!(LOGIN_ROLES as readonly string[]).includes(value)) {
    throw new ApiError(
      400,
      'INVALID_INPUT',
      `role must be one of: ${LOGIN_ROLES.join(', ')} (instructors do not have login accounts).`,
    );
  }
}

function assertStatus(value: string) {
  if (!(ACCOUNT_STATUSES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `status must be one of: ${ACCOUNT_STATUSES.join(', ')}`);
  }
}

// pg raises 23505 (unique_violation) on the email / staff_id unique indexes —
// translate the two we can hit into clean, specific 409s.
function translateUniqueViolation(err: unknown): never {
  const e = err as { code?: string; constraint?: string };
  if (e.code === '23505') {
    if (e.constraint && e.constraint.includes('staff_id')) {
      throw new ApiError(409, 'STAFF_ALREADY_LINKED', 'That staff member already has a login account.');
    }
    throw new ApiError(409, 'EMAIL_TAKEN', 'An account with that email already exists.');
  }
  throw err;
}

export async function createUser(input: CreateUserInput, actingUser: ActingUser) {
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const { role, password, staffId } = input;

  if (!email || !EMAIL_RE.test(email)) {
    throw new ApiError(400, 'INVALID_INPUT', 'A valid email is required.');
  }
  if (typeof role !== 'string') {
    throw new ApiError(400, 'INVALID_INPUT', 'role is required.');
  }
  assertRole(role);
  assertStrongPassword(password);

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  try {
    return await withUserContext(actingUser.id, async (client) => {
      if (staffId) {
        const { rows } = await client.query(`select id from public.staff where id = $1`, [staffId]);
        if (!rows[0]) {
          throw new ApiError(404, 'NOT_FOUND', 'Staff member not found.');
        }
      }
      const { rows } = await client.query(
        `insert into public.users (email, role, staff_id, status, password_hash)
         values ($1, $2, $3, 'active', $4)
         returning id`,
        [email, role, staffId ?? null, passwordHash],
      );
      const { rows: created } = await client.query(`${USER_SELECT} where id = $1`, [rows[0].id]);
      return created[0];
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    translateUniqueViolation(err);
  }
}

export async function listUsers() {
  const { rows } = await pool.query(`${USER_SELECT} order by created_at`);
  return rows;
}

export async function updateUser(id: string, input: UpdateUserInput, actingUser: ActingUser) {
  const fields: Record<string, unknown> = {};

  if (input.role !== undefined) {
    assertRole(input.role);
    fields.role = input.role;
  }
  if (input.status !== undefined) {
    assertStatus(input.status);
    fields.status = input.status;
  }
  if (input.password !== undefined) {
    assertStrongPassword(input.password);
    fields.password_hash = await bcrypt.hash(input.password, BCRYPT_COST);
  }
  if (Object.keys(fields).length === 0) {
    throw new ApiError(400, 'INVALID_INPUT', 'No updatable fields provided (role, status, password).');
  }

  try {
    return await withUserContext(actingUser.id, async (client) => {
      // Lock the target row and read its current role/status so the
      // last-manager guard below can't be raced by two concurrent updates.
      const { rows: currentRows } = await client.query(
        `select role, status from public.users where id = $1 for update`,
        [id],
      );
      if (!currentRows[0]) {
        throw new ApiError(404, 'NOT_FOUND', 'User not found.');
      }
      const current = currentRows[0];

      // Prevent locking everyone out: the only active manager can't be demoted
      // or deactivated. Uses the post-update values so partial edits are caught.
      const newRole = (fields.role as string) ?? current.role;
      const newStatus = (fields.status as string) ?? current.status;
      const staysActiveManager = newRole === 'manager' && newStatus === 'active';
      if (current.role === 'manager' && current.status === 'active' && !staysActiveManager) {
        const { rows: countRows } = await client.query(
          `select count(*)::int as others
           from public.users
           where role = 'manager' and status = 'active' and id <> $1`,
          [id],
        );
        if (countRows[0].others === 0) {
          throw new ApiError(
            409,
            'LAST_MANAGER',
            'Cannot deactivate or change the role of the only active manager.',
          );
        }
      }

      const setClauses: string[] = [];
      const params: unknown[] = [];
      for (const [column, value] of Object.entries(fields)) {
        params.push(value);
        setClauses.push(`${column} = $${params.length}`);
      }
      params.push(id);
      await client.query(`update public.users set ${setClauses.join(', ')} where id = $${params.length}`, params);

      const { rows } = await client.query(`${USER_SELECT} where id = $1`, [id]);
      return rows[0];
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    translateUniqueViolation(err);
  }
}
