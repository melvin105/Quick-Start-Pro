"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const db_1 = require("./db");
const env_1 = require("./config/env");
const rateLimit_1 = require("./middleware/rateLimit");
const auth_1 = __importDefault(require("./routes/auth"));
const students_1 = __importDefault(require("./routes/students"));
const payments_1 = __importDefault(require("./routes/payments"));
const receipts_1 = __importDefault(require("./routes/receipts"));
const audit_1 = __importDefault(require("./routes/audit"));
const packages_1 = __importDefault(require("./routes/packages"));
const reports_1 = __importDefault(require("./routes/reports"));
const finances_1 = __importDefault(require("./routes/finances"));
const endOfDay_1 = __importDefault(require("./routes/endOfDay"));
const leads_1 = __importDefault(require("./routes/leads"));
const lessons_1 = __importDefault(require("./routes/lessons"));
const instructors_1 = __importDefault(require("./routes/instructors"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const checkin_1 = __importDefault(require("./routes/checkin"));
const users_1 = __importDefault(require("./routes/users"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const scheduling_1 = __importDefault(require("./routes/scheduling"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const registrations_1 = __importDefault(require("./routes/registrations"));
const records_1 = __importDefault(require("./routes/records"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const ApiError_1 = require("./utils/ApiError");
exports.app = (0, express_1.default)();
// Deployed behind a reverse proxy, so req.ip must come from X-Forwarded-For —
// otherwise every request shares the proxy's IP and the rate limiters key on a
// single bucket (locking everyone out at once, or letting one abuser exhaust
// the shared limit). `trust proxy` = the number of proxy hops to trust: 1 for a
// single proxy in front (the default here). Do NOT use `true` (trust all hops),
// which lets a client spoof X-Forwarded-For and forge its rate-limit key. If you
// add another hop (e.g. Cloudflare in front of Nginx), bump TRUST_PROXY_HOPS.
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 1);
exports.app.set('trust proxy', Number.isFinite(trustProxyHops) ? trustProxyHops : 1);
// Security headers (HSTS, X-Content-Type-Options, frame denial, etc.). Defaults
// are appropriate for a JSON API. Placed first so every response — including
// errors and 404s — carries the headers.
exports.app.use((0, helmet_1.default)());
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
exports.app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || corsAllowlist.length === 0 || corsAllowlist.includes(origin)) {
            return callback(null, true);
        }
        // Disallowed origin: deny by omitting CORS headers (the browser blocks the
        // response) rather than throwing a 500.
        return callback(null, false);
    },
}));
// Public self-registration embeds the passport photo as a base64 data URI, which
// blows past express.json()'s 100kb default and would throw PayloadTooLargeError
// (surfacing as a generic 500). 10mb comfortably fits a phone-camera photo.
exports.app.use(express_1.default.json({ limit: '10mb' }));
// ─── Response timing ────────────────────────────────────────────────────────
// Lightweight response instrumentation. This distinguishes time spent in auth
// from total application processing time without emitting per-request logs.
exports.app.use((req, res, next) => {
    const start = Date.now();
    const originalJson = res.json.bind(res);
    res.json = ((body) => {
        if (!res.headersSent) {
            const totalMs = Date.now() - start;
            const authMs = res.locals.authDurationMs;
            const metrics = [authMs === undefined ? null : `auth;dur=${authMs}`, `app;dur=${totalMs}`]
                .filter(Boolean)
                .join(', ');
            res.setHeader('Server-Timing', metrics);
        }
        return originalJson(body);
    });
    next();
});
exports.app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
exports.app.get('/api/health/db', async (req, res) => {
    try {
        await db_1.pool.query('SELECT 1');
        res.json({ status: 'ok' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});
// Loose global rate-limit net over the whole versioned API (health checks under
// /api/health are intentionally exempt). Per-route limiters above add tighter
// caps on login and the public QR flows.
exports.app.use('/api/v1', rateLimit_1.globalLimiter);
exports.app.use('/api/v1/auth', auth_1.default);
exports.app.use('/api/v1/students', students_1.default);
exports.app.use('/api/v1/payments', payments_1.default);
exports.app.use('/api/v1/receipts', receipts_1.default);
exports.app.use('/api/v1/audit', audit_1.default);
exports.app.use('/api/v1/packages', packages_1.default);
exports.app.use('/api/v1/reports', reports_1.default);
exports.app.use('/api/v1/finances', finances_1.default);
exports.app.use('/api/v1/end-of-day', endOfDay_1.default);
exports.app.use('/api/v1/leads', leads_1.default);
exports.app.use('/api/v1/lessons', lessons_1.default);
exports.app.use('/api/v1/instructors', instructors_1.default);
exports.app.use('/api/v1/attendance', attendance_1.default);
exports.app.use('/api/v1/checkin', checkin_1.default);
exports.app.use('/api/v1/users', users_1.default);
exports.app.use('/api/v1/expenses', expenses_1.default);
exports.app.use('/api/v1/dashboard', dashboard_1.default);
exports.app.use('/api/v1/scheduling', scheduling_1.default);
exports.app.use('/api/v1/uploads', uploads_1.default);
exports.app.use('/api/v1/registrations', registrations_1.default);
exports.app.use('/api/v1/records', records_1.default);
exports.app.use('/api/v1/notifications', notifications_1.default);
exports.app.use((req, res) => {
    res.status(404).json({ error: true, message: 'Not found.', code: 'NOT_FOUND' });
});
exports.app.use((err, req, res, next) => {
    if (err instanceof ApiError_1.ApiError) {
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
        (0, env_1.validateEnv)();
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
    exports.app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
}
//# sourceMappingURL=index.js.map