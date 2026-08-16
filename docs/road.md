# Quick Start Pro — Frontend↔Backend Integration Roadmap

This roadmap tracks the work of making the React frontend operate from the
shared PostgreSQL data source through the Express API, instead of from local
zustand stores and mock data. Today the app looks substantially complete but is
almost entirely local-state driven: `lib/api.ts` is imported by exactly one file
(`features/auth/authService.ts`), while **6 zustand stores** and `finances/mockData`
back the rest of the screens.

Each item below is a GitHub issue in
[`melvin105/Quick-Start-Pro`](https://github.com/melvin105/Quick-Start-Pro/issues).
Work is grouped into phases by dependency, then by the delivery order agreed in
the migration epic (#121).

**Status legend:** ✅ done · 🟡 in progress / partially done (uncommitted) · ⬜ not started

---

## Phase 0 — Foundation (do first)

Everything else depends on a stable auth contract and a reusable way to call the
API. These are the unblockers.

| Status | Issue | What |
|--------|-------|------|
| 🟡 | [#118](https://github.com/melvin105/Quick-Start-Pro/issues/118) | **Define one authoritative frontend↔backend authentication contract** — role+password login, shared `manager`/`secretary` vocabulary, `{ token, user }` response shape, no refresh flow. |
| ⬜ | [#119](https://github.com/melvin105/Quick-Start-Pro/issues/119) | **Build a typed, reusable frontend API/service layer** — the shared client every domain calls. Hard dependency for all of Phase 2. |

> **#118 note:** implemented on branch `feature/auth-contract` (admin→manager
> rename, refresh dropped, shared `{ token, user }` shape, `docs/API-Schema.md`,
> a contract test) but **not yet committed/merged to `develop`**. Merging it
> closes #118 and unblocks #119.

---

## Phase 1 — Quality gates & reproducible setup (do alongside Phase 0)

Establish the checks that keep the migration honest, so every later PR fails
loudly on typecheck/lint/test regressions.

| Status | Issue | What |
|--------|-------|------|
| 🟡 | [#122](https://github.com/melvin105/Quick-Start-Pro/issues/122) | **Reproducible setup and integration quality gates (env, lint, tests)** — commit `frontend/.env.example`, fix the 4 lint errors + 2 warnings, add backend lint + API smoke tests, a frontend integration test, and document the Supabase/PostgreSQL verification env. |

> **#122 note:** partially addressed on `feature/auth-contract` —
> `frontend/.env.example` created (untracked) and a backend contract test added.
> Still open: the 4 lint errors (attendance + QR pages), backend lint script,
> the frontend integration test, and the README/env docs.

---

## Phase 2 — Migrate authenticated screens ([#121](https://github.com/melvin105/Quick-Start-Pro/issues/121) epic)

Move the manager/secretary workflows onto the API, one domain at a time, each as
its own reviewable pull request. Order follows the epic's suggested delivery
sequence. Every sub-issue depends on **#119** (service layer).

| # | Status | Domain | Reads from today → target |
|---|--------|--------|---------------------------|
| [#123](https://github.com/melvin105/Quick-Start-Pro/issues/123) | ⬜ | **Dashboard** (manager & secretary) | `finances/mockData` → `v_dashboard_stats`, `v_monthly_revenue`, upcoming lessons |
| [#124](https://github.com/melvin105/Quick-Start-Pro/issues/124) | ⬜ | **Students & registration approval** | `features/students/shared/store.ts` → students API; student numbers from DB trigger |
| [#125](https://github.com/melvin105/Quick-Start-Pro/issues/125) | ⬜ | **Scheduling** | `features/scheduling/shared/store.ts` → `schedule_slots` / `slot_assignments` |
| [#126](https://github.com/melvin105/Quick-Start-Pro/issues/126) | ⬜ | **Attendance** | `features/attendance/shared/store.ts` → `v_today_attendance` + mark endpoints |
| [#127](https://github.com/melvin105/Quick-Start-Pro/issues/127) | ⬜ | **Payments & receipts** | `features/payments/store.ts` → payments API; receipts from DB trigger |
| [#128](https://github.com/melvin105/Quick-Start-Pro/issues/128) | ⬜ | **Records** (daily ledger, expenses, end-of-day) | `features/records/shared/store.ts` → `v_daily_ledger`, `submit_end_of_day()` RPC |
| [#129](https://github.com/melvin105/Quick-Start-Pro/issues/129) | ⬜ | **Reports & Finances** (review/close, reports) | `finances/mockData` → finance views + `approve_end_of_day()` RPC |

**Shared acceptance criteria (all sub-issues):** loads primary data from the API;
create/update/approve/reject/assign/mark/pay actions persist and update the UI
from returned server state; manager/secretary actions enforced by backend
authorization (not just route guards); loading/empty/stale/validation/
unauthorized/not-found/server-error states handled with no silent fallback to
mock data; refresh preserves backend state; cross-page consistency (e.g. a
payment flows to student profile, records, dashboard, receipt); at least one
read + one mutation test per domain.

**Cross-domain link:** #128 (Records / Submit End of Day) and #129 (Finances
review/close) are the two halves of the same end-of-day workflow and should
share one contract.

---

## Phase 3 — Public / unauthenticated flows

Wire the flows that don't sit behind a manager/secretary login.

| Status | Issue | What |
|--------|-------|------|
| ⬜ | [#120](https://github.com/melvin105/Quick-Start-Pro/issues/120) | **Wire public registration, QR check-in, and receipt flows to the backend** — self-registration pending queue (feeds #124's approval side), QR self check-in (feeds #126's attendance), and receipt generation (shared with #127). Currently `RegisterQrPage` fabricates a session id with `Math.random()` instead of a backend token. |

---

## Dependency graph (summary)

```
#118 (auth contract) ──┐
                       ├──▶ #119 (service layer) ──▶ #123 … #129  (Phase 2 domains)
#122 (quality gates) ──┘                          └─▶ #120        (Phase 3 public flows)
```

- **#118** and **#119** unblock everything authenticated.
- **#122** runs in parallel and gates every PR.
- Within Phase 2, domains are independent once #119 lands, but the suggested
  order front-loads the highest-value operational paths.
- **#120** shares contracts with #124 (registration), #126 (attendance), and
  #127 (receipts) — coordinate so each contract is defined once.

---

## Suggested milestone grouping

1. **Milestone: Integration foundation** — #118, #119, #122
2. **Milestone: Core operations online** — #123, #124, #125, #126, #127
3. **Milestone: Close-out & public flows** — #128, #129, #120

_Last updated: 2026-08-16._
