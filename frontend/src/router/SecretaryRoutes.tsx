import type { RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '../components/layout/AppShell'
import { ROLES } from '../lib/constants'

import DashboardPage from '../pages/secretary/DashboardPage'
import StudentsPage from '../pages/secretary/StudentsPage'
import StudentsLicencesPage from '../pages/secretary/StudentsLicencesPage'
import RegisterStudentPage from '../pages/secretary/RegisterStudentPage'
import RegisterQrPage from '../pages/secretary/RegisterQrPage'
import StudentProfilePage from '../pages/secretary/StudentProfilePage'
import EditStudentPage from '../pages/secretary/EditStudentPage'
import LicenceProgressPage from '../pages/secretary/LicenceProgressPage'
import SchedulingPage from '../pages/secretary/SchedulingPage'
import AttendancePage from '../pages/secretary/AttendancePage'
import AttendanceHistoryPage from '../pages/secretary/AttendanceHistoryPage'
import PaymentsPage from '../pages/secretary/PaymentsPage'
import RecordsPage from '../pages/secretary/RecordsPage'
import ReceiptPage from '../pages/public/ReceiptPage'

// role !== 'secretary' redirects to /manager/dashboard (ProtectedRoute -> ROUTES.DASHBOARD
// resolves per the signed-in user's own role).
const secretaryRoutes: RouteObject = {
  path: 'secretary',
  element: <ProtectedRoute roles={[ROLES.SECRETARY]} />,
  children: [
    // Printable receipt — auth required, but no sidebar/topbar chrome.
    { path: 'payments/:id/receipt', element: <ReceiptPage /> },
    {
      element: <AppShell />,
      children: [
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'students', element: <StudentsPage /> },
        { path: 'students/licences', element: <StudentsLicencesPage /> },
        { path: 'students/register', element: <RegisterStudentPage /> },
        { path: 'students/register/qr', element: <RegisterQrPage /> },
        { path: 'students/:id', element: <StudentProfilePage /> },
        { path: 'students/:id/edit', element: <EditStudentPage /> },
        { path: 'students/:id/licence', element: <LicenceProgressPage /> },
        { path: 'schedule', element: <SchedulingPage /> },
        { path: 'attendance', element: <AttendancePage /> },
        { path: 'attendance/history', element: <AttendanceHistoryPage /> },
        { path: 'payments', element: <PaymentsPage /> },
        { path: 'records', element: <RecordsPage /> },
      ],
    },
  ],
}

export default secretaryRoutes
