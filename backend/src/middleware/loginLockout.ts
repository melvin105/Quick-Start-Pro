import { NextFunction, Request, Response } from 'express';

// Per-IP login lockout — a second, failure-specific layer on top of the login
// rate limiter (see rateLimit.ts). The rate limiter caps ALL login calls per
// IP; this only counts *failed* ones, and after a short streak it blocks that
// IP for a cooldown.
//
// Deliberately keyed by IP, NOT by account: logins here are role-based with
// only two shared accounts (manager, secretary). An account-keyed lock could be
// abused to lock the real manager out of their own school (DoS). Keying on IP
// means an attacker only ever blocks their own address; a legitimate user on a
// different network is unaffected.
//
// State is in-memory, so it resets on restart and isn't shared across multiple
// instances. That's an accepted trade-off for this single-instance deployment —
// the rate limiter and password policy remain in force regardless, and a
// restart only clears an attacker's accrued penalty, it never opens a hole.

export interface LoginLockoutOptions {
  threshold: number; // consecutive failures from one IP before it's locked
  cooldownMs: number; // how long the IP stays locked
  windowMs: number; // gap after which an old failure streak is forgotten
  now?: () => number; // injectable clock (tests)
  maxEntries?: number; // safety cap so the map can't grow unbounded
}

interface Attempt {
  fails: number;
  lastFailAt: number;
  lockedUntil: number;
}

export interface LoginLockout {
  /** True if this IP is currently locked; also returns seconds remaining. */
  status(ip: string): { locked: boolean; retryAfterSec: number };
  recordFailure(ip: string): void;
  recordSuccess(ip: string): void;
  /** Express middleware for the login route. */
  middleware: (req: Request, res: Response, next: NextFunction) => void;
  /** Test helper. */
  reset(): void;
}

export function createLoginLockout(options: LoginLockoutOptions): LoginLockout {
  const { threshold, cooldownMs, windowMs, maxEntries = 10_000 } = options;
  const now = options.now ?? Date.now;
  const attempts = new Map<string, Attempt>();

  // Lazily drop entries that are both unlocked and past their failure window,
  // so the map doesn't accumulate one row per attacker IP forever.
  function prune(current: number): void {
    for (const [ip, a] of attempts) {
      if (a.lockedUntil <= current && current - a.lastFailAt > windowMs) {
        attempts.delete(ip);
      }
    }
  }

  function status(ip: string): { locked: boolean; retryAfterSec: number } {
    const a = attempts.get(ip);
    const current = now();
    if (a && a.lockedUntil > current) {
      return { locked: true, retryAfterSec: Math.ceil((a.lockedUntil - current) / 1000) };
    }
    return { locked: false, retryAfterSec: 0 };
  }

  function recordFailure(ip: string): void {
    const current = now();
    let a = attempts.get(ip);

    // Start (or restart) the streak if this is a new IP or the previous streak
    // has gone stale.
    if (!a || current - a.lastFailAt > windowMs) {
      a = { fails: 0, lastFailAt: current, lockedUntil: 0 };
      // Bound memory: if we're at the cap and adding a genuinely new IP, prune
      // first; if still full, drop the oldest-touched entry.
      if (!attempts.has(ip) && attempts.size >= maxEntries) {
        prune(current);
        if (attempts.size >= maxEntries) {
          const oldest = [...attempts.entries()].sort((x, y) => x[1].lastFailAt - y[1].lastFailAt)[0];
          if (oldest) attempts.delete(oldest[0]);
        }
      }
      attempts.set(ip, a);
    }

    a.fails += 1;
    a.lastFailAt = current;
    if (a.fails >= threshold) {
      a.lockedUntil = current + cooldownMs;
      a.fails = 0; // reset the counter; the lock itself now gates further tries
    }
  }

  function recordSuccess(ip: string): void {
    // A correct login clears the IP's penalty entirely.
    attempts.delete(ip);
  }

  function middleware(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip ?? 'unknown';
    const { locked, retryAfterSec } = status(ip);

    if (locked) {
      res.setHeader('Retry-After', String(retryAfterSec));
      const mins = Math.max(1, Math.ceil(retryAfterSec / 60));
      res.status(429).json({
        error: true,
        code: 'TOO_MANY_ATTEMPTS',
        message: `Too many failed login attempts. Try again in about ${mins} minute${mins === 1 ? '' : 's'}.`,
      });
      return;
    }

    // Record the outcome once the response is sent. A 401 (bad credentials) is a
    // failed attempt; a 200 clears the streak. Other statuses (400 malformed
    // body, 500) are left untouched — they aren't credential guesses.
    res.on('finish', () => {
      if (res.statusCode === 401) recordFailure(ip);
      else if (res.statusCode === 200) recordSuccess(ip);
    });

    next();
  }

  function reset(): void {
    attempts.clear();
  }

  return { status, recordFailure, recordSuccess, middleware, reset };
}

// App-wide instance used by the login route. 5 consecutive failures from an IP
// → locked for 15 minutes; a failure streak older than 15 minutes is forgotten.
export const loginLockout = createLoginLockout({
  threshold: 5,
  cooldownMs: 15 * 60_000,
  windowMs: 15 * 60_000,
});
