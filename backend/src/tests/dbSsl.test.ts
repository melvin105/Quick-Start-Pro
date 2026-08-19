import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { resolveDbSsl } from '../db';

// resolveDbSsl is pure over its env argument, so we can exhaustively check the
// TLS policy without opening a database connection.

test('verifies against the bundled Supabase CA by default (no env set)', () => {
  const ssl = resolveDbSsl({}) as { rejectUnauthorized?: boolean; ca?: string };
  assert.notEqual(ssl, false);
  assert.equal(ssl.rejectUnauthorized, true);
  // The repo ships Supabase's public root CA so verification works out of the
  // box — the default must pin it, not rely on Node's system store (which does
  // NOT trust the Supabase pooler's chain).
  assert.ok(ssl.ca && ssl.ca.includes('BEGIN CERTIFICATE'), 'expected bundled CA PEM');
});

test('falls back to the system trust store when no CA is available', () => {
  // bundledCaPath=null models the bundled cert being absent and no env override.
  const ssl = resolveDbSsl({}, null) as { rejectUnauthorized?: boolean };
  assert.notEqual(ssl, false);
  assert.equal(ssl.rejectUnauthorized, true);
  assert.equal('ca' in (ssl as object), false);
});

test('DB_SSL=disable turns TLS off entirely', () => {
  assert.equal(resolveDbSsl({ DB_SSL: 'disable' }), false);
});

test('DB_SSL_REJECT_UNAUTHORIZED=false downgrades to unverified (escape hatch)', () => {
  const ssl = resolveDbSsl({ DB_SSL_REJECT_UNAUTHORIZED: 'false' });
  assert.equal((ssl as { rejectUnauthorized?: boolean }).rejectUnauthorized, false);
});

test('any other value of DB_SSL_REJECT_UNAUTHORIZED still verifies', () => {
  const ssl = resolveDbSsl({ DB_SSL_REJECT_UNAUTHORIZED: 'true' });
  assert.equal((ssl as { rejectUnauthorized?: boolean }).rejectUnauthorized, true);
});

test('inline CA PEM is used and its escaped newlines are normalised', () => {
  const pem = '-----BEGIN CERTIFICATE-----\\nMIIB\\n-----END CERTIFICATE-----';
  const ssl = resolveDbSsl({ SUPABASE_DB_CA_CERT: pem }) as { ca?: string; rejectUnauthorized?: boolean };
  assert.equal(ssl.rejectUnauthorized, true);
  assert.equal(ssl.ca, '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----');
});

test('a CA file path is read from disk', () => {
  const file = join(tmpdir(), `qsp-ca-${Date.now()}.crt`);
  writeFileSync(file, 'CA-FILE-CONTENTS');
  try {
    const ssl = resolveDbSsl({ SUPABASE_DB_CA_CERT_PATH: file }) as { ca?: string };
    assert.equal(ssl.ca, 'CA-FILE-CONTENTS');
  } finally {
    rmSync(file, { force: true });
  }
});

test('a missing CA file path fails fast with a clear error', () => {
  assert.throws(
    () => resolveDbSsl({ SUPABASE_DB_CA_CERT_PATH: '/no/such/ca.crt' }),
    /Could not read SUPABASE_DB_CA_CERT_PATH/,
  );
});

test('a pinned CA path takes precedence over inline PEM', () => {
  const file = join(tmpdir(), `qsp-ca-${Date.now()}-2.crt`);
  writeFileSync(file, 'FROM-FILE');
  try {
    const ssl = resolveDbSsl({
      SUPABASE_DB_CA_CERT_PATH: file,
      SUPABASE_DB_CA_CERT: 'FROM-INLINE',
    }) as { ca?: string };
    assert.equal(ssl.ca, 'FROM-FILE');
  } finally {
    rmSync(file, { force: true });
  }
});
