import { test } from 'node:test';
import assert from 'node:assert/strict';
import { passwordProblems, assertStrongPassword, MIN_PASSWORD_LENGTH } from '../utils/passwordPolicy';
import { ApiError } from '../utils/ApiError';

test('accepts a password meeting all requirements', () => {
  assert.deepEqual(passwordProblems('Spintex2026road'), []);
});

test('rejects a password that is too short', () => {
  const problems = passwordProblems('Ab1'); // 3 chars
  assert.ok(problems.some((p) => p.includes(`${MIN_PASSWORD_LENGTH} characters`)));
});

test('rejects a password with no digits', () => {
  assert.deepEqual(passwordProblems('onlylettershere'), ['include at least one number']);
});

test('rejects a password with no letters', () => {
  assert.deepEqual(passwordProblems('1234567890'), [
    // all-digits also happens to be blocklisted, so both reasons surface
    'include at least one letter',
    'not be a commonly-used or easily-guessed password',
  ]);
});

test('rejects a common/guessable password even if it meets the char rules', () => {
  // "password123" is long enough and mixes letters+digits, but is blocklisted.
  assert.deepEqual(passwordProblems('password123'), [
    'not be a commonly-used or easily-guessed password',
  ]);
});

test('blocklist is case-insensitive', () => {
  assert.ok(passwordProblems('QuickStartPro').includes('not be a commonly-used or easily-guessed password'));
});

test('non-string input is reported as missing', () => {
  assert.deepEqual(passwordProblems(undefined), ['Password is required.']);
  assert.deepEqual(passwordProblems(12345678901 as unknown), ['Password is required.']);
});

test('assertStrongPassword throws a 400 WEAK_PASSWORD listing every failed rule', () => {
  try {
    assertStrongPassword('short'); // too short AND no digit
    assert.fail('expected assertStrongPassword to throw');
  } catch (err) {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 400);
    assert.equal(err.code, 'WEAK_PASSWORD');
    assert.match(err.message, /at least 10 characters/);
    assert.match(err.message, /one number/);
    assert.match(err.message, / and /); // reasons are joined
  }
});

test('assertStrongPassword is a no-op for a valid password', () => {
  assert.doesNotThrow(() => assertStrongPassword('Accra12345drive'));
});
