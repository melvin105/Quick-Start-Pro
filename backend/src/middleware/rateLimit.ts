import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';

// Rate limiters that cap abuse of the most sensitive endpoints: login
// (password brute-forcing), the public QR flows (student-PII enumeration and
// spam), and a loose global net over everything else.
//
// IMPORTANT — shared IPs: at the school, many students self-check-in from the
// SAME public IP (the kiosk / office Wi-Fi), so the public limiter must be
// generous enough not to lock out a legitimately busy morning. The point is to
// stop automated mass abuse, not to cap normal same-network traffic.
//
// Keying: limits are per client IP (req.ip). In local dev there is no proxy, so
// req.ip is the real address. Behind a reverse proxy in production you must set
// `app.set('trust proxy', 1)` (or the correct hop count) so req.ip isn't the
// proxy's address — but do NOT set it blindly, as a wrong value lets clients
// spoof the key via X-Forwarded-For and bypass these limits.

// Return the app's standard error JSON shape (matching the global error handler)
// instead of express-rate-limit's default plain-text body.
function tooMany(message: string) {
  return (_req: Request, res: Response) => {
    res.status(429).json({ error: true, message, code: 'RATE_LIMITED' });
  };
}

const shared: Partial<Options> = {
  standardHeaders: 'draft-7', // emit RateLimit-* headers so clients can back off
  legacyHeaders: false,       // drop the deprecated X-RateLimit-* headers
};

// Login: a handful of attempts per IP per 15 min. Enough for a staff member who
// fat-fingers their password; far below what password-guessing needs.
export const loginLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  handler: tooMany('Too many login attempts. Please wait a few minutes and try again.'),
});

// Public QR flows (check-in lookup/submit, lead + registration submission).
// Generous because of the shared-kiosk IP note above, but still a hard ceiling
// that makes scripted phone-number enumeration or spam impractical.
export const publicFlowLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 60,
  handler: tooMany('Too many requests. Please wait a moment and try again.'),
});

// Public receipt links (GET /receipts/:id). A receipt is a shareable, login-free
// capability URL guarded only by its unguessable UUID; this caps how fast anyone
// can pull receipts from a single IP, so a leaked link can't be turned into a
// scraping tap and blind UUID-guessing stays hopeless. Generous because staff
// legitimately view/print several receipts in a session from the one office IP.
export const receiptLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 100,
  handler: tooMany('Too many receipt requests. Please wait a moment and try again.'),
});

// Loose global net over the whole API as defense-in-depth. Sized so no normal
// user hits it; it only trips runaway loops or crude flooding.
export const globalLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  handler: tooMany('Too many requests. Please slow down.'),
});
