-- ============================================================
-- DrivePro / Quick Start Pro — 08_revoked_tokens.sql  (run EIGHTH)
-- JWTs are stateless and can't be invalidated on their own. Logout
-- (#7) needs a denylist: every issued token carries a `jti` claim,
-- and logging out records that jti here until the token would have
-- expired anyway. The auth middleware checks this table on every
-- request.
-- ============================================================

create table if not exists public.revoked_tokens (
  jti        uuid primary key,
  expires_at timestamptz not null,
  revoked_at timestamptz not null default now()
);

create index if not exists idx_revoked_tokens_expires_at on public.revoked_tokens (expires_at);
