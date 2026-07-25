import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { ROUTES, type Role } from '../lib/constants'

interface ProtectedRouteProps {
  roles?: Role[]
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  if (!token || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
