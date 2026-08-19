import { useNavigate } from 'react-router-dom'
import useAuthStore from './authStore'
import { ROUTES } from '../../lib/constants'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const clearAuth = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const logout = () => {
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
