import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../utils/ApiError';
import { assertRegistrationToken, createRegistrationToken } from '../services/publicTokenService';

process.env.PUBLIC_FLOW_SECRET = 'phase-3-test-secret-that-is-long-enough';

// Only RegisterQrPage's phone-personalized invite link still mints/checks a
// token — the walk-in poster QR and the check-in QR are both plain static
// links now (see registrationService.submitRegistration and checkinService).

test('registration token validates the phone it was issued for', () => {
  const { token, expiresAt } = createRegistrationToken('024 000 0000');
  assert.ok(Date.parse(expiresAt) > Date.now());
  assert.doesNotThrow(() => assertRegistrationToken(token, '0240000000'));
});

test('registration token rejects a different phone number', () => {
  const { token } = createRegistrationToken('0240000000');
  assert.throws(
    () => assertRegistrationToken(token, '0550000000'),
    (error: unknown) => error instanceof ApiError && error.code === 'PHONE_MISMATCH',
  );
});
