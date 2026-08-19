import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBody } from '../middleware/validate';
import {
  loginBodySchema,
  createPaymentSchema,
  updatePaymentSchema,
  createExpenseSchema,
  createStudentSchema,
  updateStudentSchema,
} from '../schemas';
import { ApiError } from '../utils/ApiError';

const VALID_UUID = '11111111-1111-4111-8111-111111111111';

// Drives the middleware the way Express would: a body in, and either the parsed
// body on req or an ApiError passed to next().
function run(schema: Parameters<typeof validateBody>[0], body: unknown) {
  const req = { body } as { body: unknown };
  let error: unknown;
  validateBody(schema)(req as never, {} as never, (err?: unknown) => {
    error = err;
  });
  return { req, error };
}

test('accepts a valid payment and coerces a numeric-string amount to a number', () => {
  const { req, error } = run(createPaymentSchema, {
    studentId: VALID_UUID,
    amount: '500',
    method: 'cash',
  });
  assert.equal(error, undefined);
  assert.equal((req.body as { amount: number }).amount, 500);
  assert.equal(typeof (req.body as { amount: number }).amount, 'number');
});

test('rejects a non-positive payment amount with a 400 VALIDATION_ERROR', () => {
  const { error } = run(createPaymentSchema, { studentId: VALID_UUID, amount: 0, method: 'cash' });
  assert.ok(error instanceof ApiError);
  assert.equal((error as ApiError).status, 400);
  assert.equal((error as ApiError).code, 'VALIDATION_ERROR');
  assert.match((error as ApiError).message, /amount/);
});

test('rejects an unknown payment method and names the allowed values', () => {
  const { error } = run(createPaymentSchema, { studentId: VALID_UUID, amount: 50, method: 'bitcoin' });
  assert.ok(error instanceof ApiError);
  assert.match((error as ApiError).message, /method: must be one of: cash, momo, bank_transfer, cheque/);
});

test('rejects a malformed studentId UUID (would otherwise reach Postgres as a 500)', () => {
  const { error } = run(createPaymentSchema, { studentId: 'not-a-uuid', amount: 50, method: 'cash' });
  assert.ok(error instanceof ApiError);
  assert.match((error as ApiError).message, /studentId/);
});

test('strips unknown keys on a create schema', () => {
  const { req, error } = run(createPaymentSchema, {
    studentId: VALID_UUID,
    amount: 50,
    method: 'cash',
    hackerField: 'ignore me',
  });
  assert.equal(error, undefined);
  assert.equal('hackerField' in (req.body as object), false);
});

test('update schema passes unknown profile fields through untouched', () => {
  const { req, error } = run(updateStudentSchema, {
    remarks: 'follow up next week',
    eyeTestDone: true,
    status: 'active',
  });
  assert.equal(error, undefined);
  assert.equal((req.body as { remarks?: string }).remarks, 'follow up next week');
  assert.equal((req.body as { eyeTestDone?: boolean }).eyeTestDone, true);
});

test('update payment schema tolerates a partial body', () => {
  const { error } = run(updatePaymentSchema, { notes: 'correction' });
  assert.equal(error, undefined);
});

test('login schema stays permissive: any-string role and empty password are accepted', () => {
  // So an unknown role / blank password still reaches the service and yields the
  // SAME generic 401 — the boundary must not leak which roles exist.
  const { error } = run(loginBodySchema, { role: 'ghost', password: '' });
  assert.equal(error, undefined);
});

test('login schema rejects a non-string password', () => {
  const { error } = run(loginBodySchema, { role: 'manager', password: 12345 });
  assert.ok(error instanceof ApiError);
  assert.equal((error as ApiError).code, 'VALIDATION_ERROR');
});

test('expense create requires a known category', () => {
  const { error } = run(createExpenseSchema, { category: 'bribes', amount: 20 });
  assert.ok(error instanceof ApiError);
  assert.match((error as ApiError).message, /category: must be one of/);
});

test('student create requires the core fields and a valid gender/enrolment', () => {
  const ok = run(createStudentSchema, {
    firstName: 'Ama',
    lastName: 'Mensah',
    gender: 'female',
    dob: '2000-01-01',
    phone: '0244000000',
    enrolmentType: 'driving_only',
  });
  assert.equal(ok.error, undefined);

  const bad = run(createStudentSchema, {
    firstName: 'Ama',
    lastName: 'Mensah',
    gender: 'other',
    dob: '2000-01-01',
    phone: '0244000000',
    enrolmentType: 'driving_only',
  });
  assert.ok(bad.error instanceof ApiError);
  assert.match((bad.error as ApiError).message, /gender: must be one of: male, female/);
});
