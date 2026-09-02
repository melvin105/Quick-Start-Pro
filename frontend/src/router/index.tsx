/* eslint-disable react-refresh/only-export-components -- route configuration owns lazy component references */
import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, redirect } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import LoadingState from '../components/ui/LoadingState'
import secretaryRoutes from './SecretaryRoutes'
import managerRoutes from './ManagerRoutes'
import { ROUTES } from '../lib/constants'

const CheckInPage = lazy(() => import('../pages/public/CheckInPage'))
const RegisterPage = lazy(() => import('../pages/public/RegisterPage'))
const ReceiptPage = lazy(() => import('../pages/public/ReceiptPage'))

function loadRoute(element: ReactNode) {
  return <Suspense fallback={<LoadingState message="Loading pageâ€¦" />}>{element}</Suspense>
}

// ROUTES.DASHBOARD depends on the signed-in user's role, so it's resolved in
// a loader (runs fresh on every navigation) rather than baked into a route
// element at module-load time.
function homeLoader() {
  return redirect(ROUTES.DASHBOARD)
}

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    // Public, unauthenticated student self check-in — no AppShell/sidebar.
    path: ROUTES.CHECK_IN,
    element: loadRoute(<CheckInPage />),
  },
  {
    // Public, unauthenticated student self-registration — no AppShell/sidebar.
    path: ROUTES.REGISTER,
    element: loadRoute(<RegisterPage />),
  },
  {
    path: `${ROUTES.REGISTER}/:token`,
    element: loadRoute(<RegisterPage />),
  },
  {
    // Public, unauthenticated shareable receipt — no login required.
    path: '/receipt/:id',
    element: loadRoute(<ReceiptPage />),
  },
  {
    path: '/',
    loader: homeLoader,
  },
  secretaryRoutes,
  managerRoutes,
  {
    path: '*',
    loader: homeLoader,
  },
])

export default router
