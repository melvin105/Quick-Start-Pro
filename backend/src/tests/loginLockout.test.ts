import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLoginLockout } from '../middleware/loginLockout';

// A controllable clock so lockout timing is deterministic (no real waiting).
function fakeClock(start = 1_000_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => { t += ms; } };
}

const OPTS = { threshold: 3, cooldownMs: 10_000, windowMs: 30_000 };

test('an IP is not locked before hitting the failure threshold', () => {
  const clock = fakeClock();
  const lock = createLoginLockout({ ...OPTS, now: clock.now });

  lock.recordFailure('1.1.1.1');
  lock.recordFailure('1.1.1.1');
  assert.equal(lock.status('1.1.1.1').locked, false);
});

test('an IP locks on the Nth consecutive failure and reports a retry time', () => {
  const clock = fakeClock();
  const lock = createLoginLockout({ ...OPTS, now: clock.now });

  lock.recordFailure('1.1.1.1');
  lock.recordFailure('1.1.1.1');
  lock.recordFailure('1.1.1.1'); // 3rd -> locked

  const s = lock.status('1.1.1.1');
  assert.equal(s.locked, true);
  assert.equal(s.retryAfterSec, 10); // cooldownMs / 1000
});

test('the lock clears after the cooldown elapses', () => {
  const clock = fakeClock();
  const lock = createLoginLockout({ ...OPTS, now: clock.now });

  for (let i = 0; i < 3; i++) lock.recordFailure('1.1.1.1');
  assert.equal(lock.status('1.1.1.1').locked, true);

  clock.advance(10_001);
  assert.equal(lock.status('1.1.1.1').locked, false);
});

test('a successful login clears the failure streak', () => {
  const clock = fakeClock();
  const lock = createLoginLockout({ ...OPTS, now: clock.now });

  lock.recordFailure('1.1.1.1');
  lock.recordFailure('1.1.1.1');
  lock.recordSuccess('1.1.1.1');

  // Streak reset: two fresh failures should not lock (would need 3 again).
  lock.recordFailure('1.1.1.1');
  lock.recordFailure('1.1.1.1');
  assert.equal(lock.status('1.1.1.1').locked, false);
});

test('a stale failure streak is forgotten after the window', () => {
  const clock = fakeClock();
  const lock = createLoginLockout({ ...OPTS, now: clock.now });

  lock.recordFailure('1.1.1.1');
  lock.recordFailure('1.1.1.1');

  clock.advance(30_001); // beyond windowMs -> streak forgotten

  lock.recordFailure('1.1.1.1'); // counts as the 1st again
  assert.equal(lock.status('1.1.1.1').locked, false);
});

test('lockout is isolated per IP (no cross-IP DoS)', () => {
  const clock = fakeClock();
  const lock = createLoginLockout({ ...OPTS, now: clock.now });

  for (let i = 0; i < 3; i++) lock.recordFailure('9.9.9.9'); // attacker
  assert.equal(lock.status('9.9.9.9').locked, true);
  assert.equal(lock.status('2.2.2.2').locked, false); // legitimate user elsewhere
});
