import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import StudentsPage from '../pages/StudentsPage'
import SchedulingPage from '../pages/SchedulingPage'
import AttendancePage from '../pages/AttendancePage'
import PaymentsPage from '../pages/PaymentsPage'
import RecordsPage from '../pages/RecordsPage'
import FinancesPage from '../pages/FinancesPage'
import ReportsPage from '../pages/ReportsPage'
import StaffPage from '../pages/StaffPage'
import AuditLogPage from '../pages/AuditLogPage'
import SettingsPage from '../pages/SettingsPage'
import { ROLES, ROUTES } from '../lib/constants'

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
      {
        element: <AppShell />,
        children: [
          { path: ROUTES.DASHBOARD,  element: <DashboardPage /> },
          { path: ROUTES.SCHEDULING, element: <SchedulingPage /> },
          { path: ROUTES.ATTENDANCE, element: <AttendancePage /> },
          { path: ROUTES.SETTINGS,   element: <SettingsPage /> },
          {
            element: <ProtectedRoute roles={[ROLES.SECRETARY, ROLES.ADMIN]} />,
            children: [
              { path: ROUTES.STUDENTS, element: <StudentsPage /> },
              { path: ROUTES.PAYMENTS, element: <PaymentsPage /> },
              { path: ROUTES.RECORDS,  element: <RecordsPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={[ROLES.ADMIN]} />,
            children: [
              { path: ROUTES.FINANCES,  element: <FinancesPage /> },
              { path: ROUTES.REPORTS,   element: <ReportsPage /> },
              { path: ROUTES.STAFF,     element: <StaffPage /> },
              { path: ROUTES.AUDIT_LOG, element: <AuditLogPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
])

export default router
