import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool } from './db';
import { validateEnv } from './config/env';
import { globalLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import paymentRoutes from './routes/payments';
import receiptRoutes from './routes/receipts';
import auditRoutes from './routes/audit';
import packageRoutes from './routes/packages';
import reportRoutes from './routes/reports';
import financeRoutes from './routes/finances';
import endOfDayRoutes from './routes/endOfDay';
import leadRoutes from './routes/leads';
import lessonRoutes from './routes/lessons';
import instructorRoutes from './routes/instructors';
import attendanceRoutes from './routes/attendance';
import checkinRoutes from './routes/checkin';
import userRoutes from './routes/users';
import expenseRoutes from './routes/expenses';
import dashboardRoutes from './routes/dashboard';
import schedulingRoutes from './routes/scheduling';
import uploadRoutes from './routes/uploads';
import registrationRoutes from './routes/registrations';
import recordsRoutes from './routes/records';
import notificationRoutes from './routes/notifications';
import { ApiError } from './utils/ApiError';

export const app = express();

// Deployed behind a reverse proxy, so req.ip must come from X-Forwarded-For —
// otherwise every request shares the proxy's IP and the rate limiters key on a
// single bucket (locking everyone out at once, or letting one abuser exhaust
// the shared limit). `trust proxy` = the number of proxy hops to trust: 1 for a
// single proxy in front (the default here). Do NOT use `true` (trust all hops),
// which lets a client spoof X-Forwarded-For and forge its rate-limit key. If you
// add another hop (e.g. Cloudflare in front of Nginx), bump TRUST_PROXY_HOPS.
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 1);
app.set('trust proxy', Number.isFinite(trustProxyHops) ? trustProxyHops : 1);

// Security headers (HSTS, X-Content-Type-Options, frame denial, etc.). Defaults
// are appropriate for a JSON API. Placed first so every response — including
// errors and 404s — carries the headers.
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allowlist the browser origin(s) permitted to call the API. Set CORS_ORIGINS
// in the backend env to a comma-separated list in production
// (e.g. "https://app.example.com"). When it's unset we fall back to reflecting
// any origin — convenient for local/LAN dev (the phone-testing setup uses a
// changing LAN IP) — but you MUST set CORS_ORIGINS in production to lock this
// down. Non-browser callers (no Origin header: curl, health checks) are always
// allowed, since browser CORS doesn't apply to them.
const corsAllowlist = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (corsAllowlist.length === 0) {
  console.warn('[cors] warning: CORS_ORIGINS not set — reflecting all origins. Set it in production.');
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsAllowlist.length === 0 || corsAllowlist.includes(origin)) {
        return callback(null, true);
      }
      // Disallowed origin: deny by omitting CORS headers (the browser blocks the
      // response) rather than throwing a 500.
      return callback(null, false);
    },
  }),
);
// Public self-registration embeds the passport photo as a base64 data URI, which
// blows past express.json()'s 100kb default and would throw PayloadTooLargeError
// (surfacing as a generic 500). 10mb comfortably fits a phone-camera photo.
app.use(express.json({ limit: '10mb' }));

// ─── Diagnostics (temporary) ────────────────────────────────────────────────
// Added to hunt down intermittent "can't reach the API" outages. Logs any
// request that takes longer than SLOW_MS (so we can see hangs vs. quick fails),
// plus requests the client aborts. Remove this block once the cause is found.
const SLOW_MS = 2_000;
app.use((req, res, next) => {
  const start = Date.now();
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (!res.headersSent) {
      const totalMs = Date.now() - start;
      const authMs = res.locals.authDurationMs as number | undefined;
      const metrics = [authMs === undefined ? null : `auth;dur=${authMs}`, `app;dur=${totalMs}`]
        .filter(Boolean)
        .join(', ');
      res.setHeader('Server-Timing', metrics);
    }
    return originalJson(body);
  }) as Response['json'];
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (ms >= SLOW_MS) console.warn(`[slow] ${res.statusCode} ${req.method} ${req.originalUrl} ${ms}ms`);
  });
  res.on('close', () => {
    if (!res.writableEnded) console.warn(`[aborted] ${req.method} ${req.originalUrl} after ${Date.now() - start}ms`);
  });
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: (err as Error).message });
  }
});

// Loose global rate-limit net over the whole versioned API (health checks under
// /api/health are intentionally exempt). Per-route limiters above add tighter
// caps on login and the public QR flows.
app.use('/api/v1', globalLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/receipts', receiptRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/finances', financeRoutes);
app.use('/api/v1/end-of-day', endOfDayRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/instructors', instructorRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/checkin', checkinRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/scheduling', schedulingRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1/records', recordsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Not found.', code: 'NOT_FOUND' });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: true, message: err.message, code: err.code });
  }
  console.error(err);
  res.status(500).json({ error: true, message: 'Internal server error.', code: 'INTERNAL_ERROR' });
});

// Last-resort safety net: a stray async error or rejected promise anywhere in
// the app should be logged, not left to crash the process (which is what takes
// the whole API offline). Errors inside a request are already handled by the
// error middleware above — this only catches what escapes it.
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', reason);
});

if (require.main === module) {
  // Fail fast on missing/weak secrets before opening the port, so the server
  // never runs in an insecure half-configured state.
  try {
    validateEnv();
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  const startedAt = Date.now();
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });

  // ─── Heartbeat (temporary) ────────────────────────────────────────────────
  // Prints every 30s so an outage is self-diagnosing: if these lines keep coming
  // while the page says "can't reach", the backend is alive and the problem is
  // the network/address, not the server. If they stop and later a fresh "Server
  // running…" appears, the process crashed and restarted. `waiting` climbing
  // means requests are queued for a DB connection (pooler exhausted). Remove
  // once the cause is found.
  const heartbeat = setInterval(() => {
    const up = Math.round((Date.now() - startedAt) / 1000);
    console.log(`[hb] up=${up}s pool total=${pool.totalCount} idle=${pool.idleCount} waiting=${pool.waitingCount}`);
  }, 30_000);
  heartbeat.unref();
}
