/* eslint-disable react-refresh/only-export-components -- route configuration owns lazy component references */
import { lazy, Suspense, type ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '../components/layout/AppShell'
import LoadingState from '../components/ui/LoadingState'
import { ROLES } from '../lib/constants'

const DashboardPage = lazy(() => import('../pages/secretary/DashboardPage'))
const StudentsPage = lazy(() => import('../pages/secretary/StudentsPage'))
const StudentsLicencesPage = lazy(() => import('../pages/secretary/StudentsLicencesPage'))
const RegisterStudentPage = lazy(() => import('../pages/secretary/RegisterStudentPage'))
const RegisterQrPage = lazy(() => import('../pages/secretary/RegisterQrPage'))
const StudentProfilePage = lazy(() => import('../pages/secretary/StudentProfilePage'))
const EditStudentPage = lazy(() => import('../pages/secretary/EditStudentPage'))
const LicenceProgressPage = lazy(() => import('../pages/secretary/LicenceProgressPage'))
const SchedulingPage = lazy(() => import('../pages/secretary/SchedulingPage'))
const UnscheduledStudentsPage = lazy(() => import('../features/scheduling/shared/UnscheduledStudentsPage'))
const AttendancePage = lazy(() => import('../pages/secretary/AttendancePage'))
const AttendanceHistoryPage = lazy(() => import('../pages/secretary/AttendanceHistoryPage'))
const PaymentsPage = lazy(() => import('../pages/secretary/PaymentsPage'))
const RecordsPage = lazy(() => import('../pages/secretary/RecordsPage'))
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage'))
const ReceiptPage = lazy(() => import('../pages/public/ReceiptPage'))

function loadRoute(element: ReactNode) {
  return <Suspense fallback={<LoadingState message="Loading pageâ€¦" />}>{element}</Suspense>
}

// role !== 'secretary' redirects to /manager/dashboard (ProtectedRoute -> ROUTES.DASHBOARD
// resolves per the signed-in user's own role).
const secretaryRoutes: RouteObject = {
  path: 'secretary',
  element: <ProtectedRoute roles={[ROLES.SECRETARY]} />,
  children: [
    // Printable receipt — auth required, but no sidebar/topbar chrome.
    { path: 'payments/:id/receipt', element: loadRoute(<ReceiptPage />) },
    {
      element: <AppShell />,
      children: [
        { path: 'dashboard', element: loadRoute(<DashboardPage />) },
        { path: 'students', element: loadRoute(<StudentsPage />) },
        { path: 'students/licences', element: loadRoute(<StudentsLicencesPage />) },
        { path: 'students/register', element: loadRoute(<RegisterStudentPage />) },
        { path: 'students/register/qr', element: loadRoute(<RegisterQrPage />) },
        { path: 'students/:id', element: loadRoute(<StudentProfilePage />) },
        { path: 'students/:id/edit', element: loadRoute(<EditStudentPage />) },
        { path: 'students/:id/licence', element: loadRoute(<LicenceProgressPage />) },
        { path: 'schedule', element: loadRoute(<SchedulingPage />) },
        { path: 'schedule/unscheduled', element: loadRoute(<UnscheduledStudentsPage />) },
        { path: 'attendance', element: loadRoute(<AttendancePage />) },
        { path: 'attendance/history', element: loadRoute(<AttendanceHistoryPage />) },
        { path: 'payments', element: loadRoute(<PaymentsPage />) },
        { path: 'records', element: loadRoute(<RecordsPage />) },
        { path: 'notifications', element: loadRoute(<NotificationsPage />) },
      ],
    },
  ],
}

export default secretaryRoutes
