import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import { ROLES, ROUTES } from '../lib/constants'

function PageShell({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
      {label} — coming soon
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: ROUTES.DASHBOARD,  element: <PageShell label="Dashboard" /> },
      { path: ROUTES.SCHEDULING, element: <PageShell label="Scheduling" /> },
      { path: ROUTES.ATTENDANCE, element: <PageShell label="Attendance" /> },
      { path: ROUTES.SETTINGS,   element: <PageShell label="Settings" /> },
    ],
  },
  {
    element: <ProtectedRoute roles={[ROLES.SECRETARY, ROLES.ADMIN]} />,
    children: [
      { path: ROUTES.STUDENTS, element: <PageShell label="Students" /> },
      { path: ROUTES.PAYMENTS, element: <PageShell label="Payments" /> },
      { path: ROUTES.RECORDS,  element: <PageShell label="Records" /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
])

export default router
