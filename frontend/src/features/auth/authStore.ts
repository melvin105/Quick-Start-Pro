import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from './authService'

interface AuthState {
  user:         User | null
  token:        string | null  // short-lived access token, sent on every request
  refreshToken: string | null  // long-lived token, used only to renew `token`
  setAuth:   (user: User, token: string, refreshToken: string) => void
  setTokens: (token: string, refreshToken: string) => void
  logout:    () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:         null,
      token:        null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),
      // Swap in a freshly-rotated token pair without touching the user — used by
      // the silent-refresh flow when the access token expires mid-session.
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      logout: () => set({ user: null, token: null, refreshToken: null }),
    }),
    { name: 'qsp-auth' },
  ),
)

export default useAuthStore
