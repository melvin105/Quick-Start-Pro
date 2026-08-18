import 'dotenv/config';
import type { Server } from 'node:http';
import { app } from '../index';

// Read-only end-to-end runtime smoke against the LIVE database.
//
// Boots the Express app in-process (same pattern as auth.contract.test.ts),
// pings the health + DB endpoints, then — if a manager password is provided —
// logs in and issues one GET per domain, asserting HTTP 200. It performs NO
// writes/updates/deletes, so it is safe to run against production data.
//
// Run it:
//   1. Health only (no login needed):
//        npm run smoke
//   2. Full authenticated sweep (PowerShell):
//        $env:TEST_MANAGER_PASSWORD = "<the manager password>"; npm run smoke
//      (bash:  TEST_MANAGER_PASSWORD="<pw>" npm run smoke)
//
// Config via env:
//   DATABASE_URL           the live connection (from .env) — already used by db.ts
//   TEST_MANAGER_PASSWORD  a valid manager password; enables the authed sweep.
//                          If unset, only the two health checks run.
//   TEST_API_URL           optional external base incl. /api/v1 (skips in-process boot)
//
// Exit code is non-zero if any executed check fails, so CI can gate on it.

const TODAY = new Date().toISOString().slice(0, 10);
const YEAR = TODAY.slice(0, 4);
const FROM = `${YEAR}-01-01`;
const TO = `${YEAR}-12-31`;

const MANAGER_PASSWORD = process.env.TEST_MANAGER_PASSWORD;

interface Check {
  name: string;
  // Path relative to the server root (e.g. '/api/health' or '/api/v1/students').
  path: string;
  auth: boolean;
}

// Health lives at /api/*, the business API at /api/v1/*.
const HEALTH_CHECKS: Check[] = [
  { name: 'server up', path: '/api/health', auth: false },
  { name: 'db connectivity (SELECT 1)', path: '/api/health/db', auth: false },
];

// One representative read per domain the frontend depends on. All manager-visible.
const API_CHECKS: Check[] = [
  { name: 'dashboard', path: '/api/v1/dashboard', auth: true },
  { name: 'students list', path: '/api/v1/students', auth: true },
  { name: 'student licences', path: '/api/v1/students/licences', auth: true },
  { name: 'attendance roster', path: `/api/v1/attendance?date=${TODAY}`, auth: true },
  { name: 'payments list', path: '/api/v1/payments', auth: true },
  { name: 'scheduling slots', path: '/api/v1/scheduling/slots', auth: true },
  { name: 'daily records', path: `/api/v1/records?date=${TODAY}`, auth: true },
  { name: 'finances', path: `/api/v1/finances?from=${FROM}&to=${TO}`, auth: true },
  { name: 'report: revenue', path: `/api/v1/reports/revenue?from=${FROM}&to=${TO}`, auth: true },
  { name: 'report: driver', path: `/api/v1/reports/driver?from=${FROM}&to=${TO}`, auth: true },
  { name: 'report: students (operational)', path: `/api/v1/reports/students?from=${FROM}&to=${TO}`, auth: true },
  { name: 'packages', path: '/api/v1/packages', auth: true },
  { name: 'instructors', path: '/api/v1/instructors', auth: true },
];

let origin = process.env.TEST_API_URL
  ? process.env.TEST_API_URL.replace(/\/api\/v1\/?$/, '')
  : '';
let server: Server | undefined;

async function boot(): Promise<void> {
  if (origin) return; // external server provided
  await new Promise<void>((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve());
    listener.once('error', reject);
    server = listener;
  });
  const address = server?.address();
  if (!address || typeof address === 'string') throw new Error('Could not determine smoke server port.');
  origin = `http://127.0.0.1:${address.port}`;
}

async function shutdown(): Promise<void> {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
}

interface Result { name: string; ok: boolean; status: number | string; detail?: string }

async function run(check: Check, token?: string): Promise<Result> {
  try {
    const res = await fetch(`${origin}${check.path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const ok = res.status === 200;
    let detail: string | undefined;
    if (!ok) {
      const body = await res.text().catch(() => '');
      detail = body.slice(0, 200);
    }
    return { name: check.name, ok, status: res.status, detail };
  } catch (err) {
    return { name: check.name, ok: false, status: 'ERR', detail: (err as Error).message };
  }
}

async function login(): Promise<string | null> {
  const res = await fetch(`${origin}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'manager', password: MANAGER_PASSWORD }),
  });
  if (res.status !== 200) {
    const body = await res.text().catch(() => '');
    console.log(`  login FAILED (${res.status}): ${body.slice(0, 200)}`);
    return null;
  }
  const data = (await res.json()) as { token?: string };
  return data.token ?? null;
}

function print(results: Result[]): void {
  for (const r of results) {
    const mark = r.ok ? 'PASS' : 'FAIL';
    const line = `  ${mark}  ${String(r.status).padEnd(4)} ${r.name}`;
    console.log(r.ok ? line : `${line}\n        ↳ ${r.detail ?? ''}`);
  }
}

async function main(): Promise<void> {
  await boot();
  console.log(`\nRuntime smoke → ${origin}  (read-only, live DB)\n`);

  const results: Result[] = [];

  console.log('Health:');
  for (const c of HEALTH_CHECKS) results.push(await run(c));
  print(results);

  if (!MANAGER_PASSWORD) {
    console.log('\nAuthenticated sweep: SKIPPED (set TEST_MANAGER_PASSWORD to enable).');
  } else {
    console.log('\nAuthenticating as manager…');
    const token = await login();
    if (!token) {
      results.push({ name: 'manager login', ok: false, status: 'AUTH', detail: 'login failed' });
    } else {
      console.log('  login PASS\n\nAuthenticated reads:');
      const authed: Result[] = [];
      for (const c of API_CHECKS) authed.push(await run(c, token));
      print(authed);
      results.push(...authed);
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  await shutdown();
  process.exit(failed.length ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Smoke run crashed:', err);
  await shutdown();
  process.exit(1);
});
