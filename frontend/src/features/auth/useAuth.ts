import { useNavigate } from 'react-router-dom'
import useAuthStore from './authStore'
import * as authService from './authService'
import { ROUTES } from '../../lib/constants'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const clearAuth = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const logout = () => {
    // Best-effort server-side revocation of the refresh token (and current
    // access token). Fire-and-forget: a network hiccup must never block the user
    // from signing out locally, which is what actually protects this device.
    const { refreshToken } = useAuthStore.getState()
    void authService.logout(refreshToken).catch(() => {})
    clearAuth()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(token && user),
    logout,
  }
}
