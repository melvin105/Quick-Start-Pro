import api from '../lib/api'
import type { Role } from '../lib/constants'

export interface LoginCredentials {
  role:     Role
  password: string
}

export interface User {
  id:    string
  name:  string
  role:  Role
  email: string
}

export interface LoginResponse {
  user:  User
  token: string
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials)
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function refreshToken(): Promise<string> {
  const { data } = await api.post<{ token: string }>('/auth/refresh')
  return data.token
}
