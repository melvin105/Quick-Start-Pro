import 'dotenv/config';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { app } from '../index';

// Contract test for the authentication endpoint (Problem 1).
//
// This is a live contract test: it starts the Express app on an ephemeral port,
// exercises it over HTTP, and
// asserts the agreed request/response shape that the frontend depends on (see
// docs/API-Schema.md and frontend/src/features/auth/authService.ts).
//
// Config via env:
//   TEST_API_URL           optional external base URL incl. /api/v1
//   TEST_MANAGER_PASSWORD  a valid manager password — enables the happy-path test.
//                          If unset, the happy-path test is skipped (the
//                          invalid-credentials and validation tests always run,
//                          since they need no seeded data).

let baseUrl = process.env.TEST_API_URL ?? '';
let server: Server | undefined;
const MANAGER_PASSWORD = process.env.TEST_MANAGER_PASSWORD;

before(async () => {
  if (baseUrl) return;
  await new Promise<void>((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve());
    listener.once('error', reject);
    server = listener;
  });
  const runningServer = server;
  if (!runningServer) throw new Error('Test server did not start.');
  const address = runningServer.address();
  if (!address || typeof address === 'string') throw new Error('Could not determine test server port.');
  baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
});

after(async () => {
  if (server) await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve()));
});

async function postLogin(body: unknown) {
  const res = await fetch(`${baseUrl}/auth/login`, {
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
