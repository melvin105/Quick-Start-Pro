import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Contract test for the authentication endpoint (Problem 1).
//
// This is a live contract test: it exercises the running backend over HTTP and
// asserts the agreed request/response shape that the frontend depends on (see
// docs/API-Schema.md and frontend/src/features/auth/authService.ts).
//
// Run it against a booted server:
//   1. In one terminal:  npm run dev            (backend on :5000)
//   2. In another:        npm test
//
// Config via env:
//   TEST_API_URL           base URL incl. /api/v1  (default http://localhost:5000/api/v1)
//   TEST_MANAGER_PASSWORD  a valid manager password — enables the happy-path test.
//                          If unset, the happy-path test is skipped (the
//                          invalid-credentials and validation tests always run,
//                          since they need no seeded data).

const BASE_URL = process.env.TEST_API_URL ?? 'http://localhost:5000/api/v1';
const MANAGER_PASSWORD = process.env.TEST_MANAGER_PASSWORD;

async function postLogin(body: unknown) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data } as { status: number; data: Record<string, unknown> };
}

test('rejects invalid credentials with a generic 401 and leaks no session', async () => {
  const { status, data } = await postLogin({ role: 'manager', password: 'definitely-wrong' });

  assert.equal(status, 401);
  assert.equal(data.error, true);
  assert.equal(data.code, 'INVALID_CREDENTIALS');
  // The error must not smuggle back a token or user object.
  assert.equal('token' in data, false);
  assert.equal('user' in data, false);
});

test('rejects an unknown role with the same generic 401', async () => {
  // "admin" is deliberately NOT a valid role — it must be indistinguishable
  // from a wrong password so attackers learn nothing.
  const { status, data } = await postLogin({ role: 'admin', password: 'whatever' });

  assert.equal(status, 401);
  assert.equal(data.code, 'INVALID_CREDENTIALS');
});

test('rejects a malformed request body with 400 INVALID_INPUT', async () => {
  const { status, data } = await postLogin({ role: 'manager' }); // no password

  assert.equal(status, 400);
  assert.equal(data.code, 'INVALID_INPUT');
});

test(
  'accepts valid manager credentials and returns the agreed { token, user } shape',
  { skip: MANAGER_PASSWORD ? false : 'set TEST_MANAGER_PASSWORD to run the happy path' },
  async () => {
    const { status, data } = await postLogin({ role: 'manager', password: MANAGER_PASSWORD });

    assert.equal(status, 200);
    assert.equal(typeof data.token, 'string');
    assert.ok((data.token as string).length > 0);

    const user = data.user as Record<string, unknown>;
    assert.ok(user, 'response must include a user object');
    assert.equal(user.role, 'manager');
    assert.equal(typeof user.id, 'string');
    assert.equal(typeof user.name, 'string');
    assert.equal(typeof user.email, 'string');
    // staffId is either a string or null — both are valid per the contract.
    assert.ok(typeof user.staffId === 'string' || user.staffId === null);
  },
);
