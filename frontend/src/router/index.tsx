import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '../components/layout/AppShell'
import LoginPage from '../pages/LoginPage'
import CheckInPage from '../pages/CheckInPage'
import DashboardPage from '../pages/DashboardPage'
import StudentsPage from '../pages/StudentsPage'
import StudentsLicencesPage from '../pages/StudentsLicencesPage'
import RegisterStudentPage from '../pages/RegisterStudentPage'
import RegisterQrPage from '../pages/RegisterQrPage'
import StudentProfilePage from '../pages/StudentProfilePage'
import EditStudentPage from '../pages/EditStudentPage'
import LicenceProgressPage from '../pages/LicenceProgressPage'
import SchedulingPage from '../pages/SchedulingPage'
import AttendancePage from '../pages/AttendancePage'
import AttendanceHistoryPage from '../pages/AttendanceHistoryPage'
import PaymentsPage from '../pages/PaymentsPage'
import ReceiptPage from '../pages/ReceiptPage'
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
    // Public, unauthenticated student self check-in — no AppShell/sidebar.
    path: ROUTES.CHECK_IN,
    element: <CheckInPage />,
  },
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      // Printable receipt — auth required, but no sidebar/topbar chrome.
      { path: ROUTES.PAYMENT_RECEIPT, element: <ReceiptPage /> },
      {
        element: <AppShell />,
        children: [
          { path: ROUTES.DASHBOARD,  element: <DashboardPage /> },
          { path: ROUTES.SCHEDULING, element: <SchedulingPage /> },
          { path: ROUTES.ATTENDANCE, element: <AttendancePage /> },
          { path: ROUTES.ATTENDANCE_HISTORY, element: <AttendanceHistoryPage /> },
          { path: ROUTES.SETTINGS,   element: <SettingsPage /> },
          {
            element: <ProtectedRoute roles={[ROLES.SECRETARY, ROLES.ADMIN]} />,
            children: [
              { path: ROUTES.STUDENTS,             element: <StudentsPage /> },
              { path: ROUTES.STUDENTS_LICENCES,     element: <StudentsLicencesPage /> },
              { path: ROUTES.STUDENTS_REGISTER,     element: <RegisterStudentPage /> },
              { path: ROUTES.STUDENTS_REGISTER_QR,  element: <RegisterQrPage /> },
              { path: ROUTES.STUDENT_PROFILE,       element: <StudentProfilePage /> },
              { path: ROUTES.STUDENT_EDIT,          element: <EditStudentPage /> },
              { path: ROUTES.STUDENT_LICENCE,       element: <LicenceProgressPage /> },
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
