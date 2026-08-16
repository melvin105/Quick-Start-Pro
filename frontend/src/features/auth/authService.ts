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
  token: string
  user:  User
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials)
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
