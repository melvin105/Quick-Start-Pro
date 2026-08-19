# Quick Start Pro — API Schema

## Conventions

- **Base URL.** All endpoints live under a single prefix: `/<host>/api/v1`.
  The frontend Axios client (`frontend/src/lib/api.ts`) sets `baseURL` from
  `VITE_API_URL` (default `http://localhost:5000/api/v1`), so service-layer
  calls are written **without** the prefix — e.g. `api.post('/auth/login')`
  resolves to `http://localhost:5000/api/v1/auth/login`.
- **Auth.** Protected endpoints expect a bearer token:
  `Authorization: Bearer <token>`. The client attaches it automatically from
  the auth store on every request.
- **Errors.** Failures return a JSON body of the shape
  `{ "error": true, "message": string, "code": string }` with an appropriate
  HTTP status. On a `401` for any request other than the login call, the client
  clears the session and redirects to `/login`.

---

## Authentication contract

The login UX is **role + password only** (no email field). The two roles that
can sign in are `manager` and `secretary` — this is the shared role vocabulary,
identical on the frontend (`ROLES` in `frontend/src/lib/constants.ts`) and the
backend (`LOGIN_ROLES` in `backend/src/services/authService.ts`). Instructors
are staff records, not login accounts.

### `POST /auth/login`

Request:

```json
{ "role": "manager", "password": "••••••••" }
```

Success `200`:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "name": "John Mensah",
    "email": "manager@quickstartpro.local",
    "role": "manager",
    "staffId": "uuid | null"
  }
}
```

The frontend mirrors this shape exactly in the `LoginResponse` / `User`
interfaces in `frontend/src/features/auth/authService.ts`; the backend produces
it from `AuthUser` in `backend/src/services/authService.ts`. `name` comes from
the linked `staff` record (falling back to the email's local part), and
`staffId` is the linked staff row (`null` if the account isn't linked to one).

Failure `401` (unknown role, no account, or wrong password — deliberately
indistinguishable):

```json
{ "error": true, "message": "Invalid role or password.", "code": "INVALID_CREDENTIALS" }
```

On success the frontend stores `{ user, token }` in the persisted auth store
(`qsp-auth`) and redirects to that role's home (`ROLE_HOME[user.role]`):
`manager → /manager/dashboard`, `secretary → /secretary/dashboard`.

### `POST /auth/logout`

Requires a bearer token. Revokes the current token (by `jti`) so it can't be
reused, and returns `{ "status": "ok" }`.

> **Note:** there is no refresh-token flow. Tokens are long-lived
> (`JWT_EXPIRES_IN`, default `7d`); when one expires or is revoked, the next
> `401` sends the user back to the login screen.
