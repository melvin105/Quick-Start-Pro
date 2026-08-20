import api from '../../lib/api'
import type { Role } from '../../lib/constants'

export interface LoginCredentials {
  role:     Role
  password: string
}

// The authenticated user, exactly as the backend returns it in the login
// response (POST /auth/login → { token, user }). `staffId` is the linked staff
// record (null for accounts not tied to a staff row). This is the single source
// of truth for the shape of a signed-in user across the app.
export interface User {
  id:      string
  name:    string
  role:    Role
  email:   string
  staffId: string | null
}

export interface LoginResponse {
  token:        string  // short-lived access token
  refreshToken: string  // long-lived token used to renew the access token
  user:         User
}

// A renewed token pair, returned by POST /auth/refresh (no user — the caller
// already has it). Rotation means the old refresh token is now invalid.
export interface RefreshResponse {
  token:        string
  refreshToken: string
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials)
  return data
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>('/auth/refresh', { refreshToken })
  return data
}

export async function logout(refreshToken: string | null): Promise<void> {
  // Send the refresh token so the server can revoke it too — otherwise a stolen
  // refresh token would outlive the logout.
  await api.post('/auth/logout', { refreshToken })
}
