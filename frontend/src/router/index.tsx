import { createBrowserRouter, redirect } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import CheckInPage from '../pages/public/CheckInPage'
import RegisterPage from '../pages/public/RegisterPage'
import ReceiptPage from '../pages/public/ReceiptPage'
import secretaryRoutes from './SecretaryRoutes'
import managerRoutes from './ManagerRoutes'
import { ROUTES } from '../lib/constants'

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
    element: <CheckInPage />,
  },
  {
    // Public, unauthenticated student self-registration — no AppShell/sidebar.
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    // Public, unauthenticated shareable receipt — no login required.
    path: '/receipt/:id',
    element: <ReceiptPage />,
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
