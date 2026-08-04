import { ApiError } from '../utils/ApiError';

// Thin client for Supabase Storage's REST API. This backend uses a raw pg
// pool and its own JWT auth (not Supabase Auth), so it cannot mint a Supabase
// user token — server-side uploads to the PRIVATE buckets are done with the
// service role key, kept only in the environment (never committed). See
// CLAUDE.md: the service role key must not be committed or shared.
//
// Kept dependency-free (global fetch) so we don't pull in @supabase/supabase-js
// just for two calls; the same helper serves every bucket (student-photos,
// ghana-cards, licence-documents).

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isStorageConfigured(): boolean {
  return Boolean(SUPABASE_URL && SERVICE_KEY);
}

function requireConfig(): { url: string; key: string } {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new ApiError(
      503,
      'STORAGE_NOT_CONFIGURED',
      'File storage is not configured on the server (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).',
    );
  }
  return { url: SUPABASE_URL, key: SERVICE_KEY };
}

/**
 * Upload raw bytes to `bucket/objectPath`. Fails if the object already exists
 * (objectPath is a fresh UUID per upload, so collisions shouldn't happen).
 * Returns the object path stored by the caller as the storage reference.
 */
export async function uploadObject(
  bucket: string,
  objectPath: string,
  body: Buffer,
  contentType: string,
): Promise<{ bucket: string; path: string }> {
  const { url, key } = requireConfig();

  const res = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      apikey: key,
      'content-type': contentType,
      'cache-control': 'max-age=3600',
      'x-upsert': 'false',
    },
    body: new Uint8Array(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new ApiError(502, 'STORAGE_UPLOAD_FAILED', `Storage upload failed (${res.status}). ${detail}`.trim());
  }

  return { bucket, path: objectPath };
}

/**
 * Create a short-lived signed URL to read a private object. The read side of
 * the reusable pattern — the frontend fetches this to display a stored photo.
 */
export async function createSignedUrl(
  bucket: string,
  objectPath: string,
  expiresIn = 3600,
): Promise<string> {
  const { url, key } = requireConfig();

  const res = await fetch(`${url}/storage/v1/object/sign/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, apikey: key, 'content-type': 'application/json' },
    body: JSON.stringify({ expiresIn }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new ApiError(502, 'STORAGE_SIGN_FAILED', `Could not sign storage URL (${res.status}). ${detail}`.trim());
  }

  const { signedURL } = (await res.json()) as { signedURL: string };
  return `${url}/storage/v1${signedURL}`;
}
