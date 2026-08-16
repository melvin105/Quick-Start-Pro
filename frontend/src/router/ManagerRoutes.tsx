import type { RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '../components/layout/AppShell'
import { ROLES } from '../lib/constants'

import DashboardPage from '../pages/manager/DashboardPage'
import StudentsPage from '../pages/manager/StudentsPage'
import StudentProfilePage from '../pages/manager/StudentProfilePage'
import SchedulePage from '../pages/manager/SchedulePage'
import AttendancePage from '../pages/manager/AttendancePage'
import AttendanceHistoryPage from '../pages/manager/AttendanceHistoryPage'
import RecordsPage from '../pages/manager/RecordsPage'
import FinancesPage from '../pages/manager/FinancesPage'
import ReportsPage from '../pages/manager/ReportsPage'
import DriverReportPage from '../pages/manager/reports/DriverReportPage'
import ReportPlaceholderPage from '../features/reports/ReportPlaceholderPage'
import StaffPage from '../pages/manager/StaffPage'
import StaffProfilePage from '../pages/manager/StaffProfilePage'
import AuditLogPage from '../pages/manager/AuditLogPage'
import SettingsPage from '../pages/manager/SettingsPage'

// role !== 'manager' redirects to /secretary/dashboard (ProtectedRoute -> ROUTES.DASHBOARD
// resolves per the signed-in user's own role).
const managerRoutes: RouteObject = {
  path: 'manager',
  element: <ProtectedRoute roles={[ROLES.MANAGER]} />,
  children: [
    {
      element: <AppShell />,
      children: [
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'students', element: <StudentsPage /> },
        { path: 'students/:id', element: <StudentProfilePage /> },
        { path: 'schedule', element: <SchedulePage /> },
        { path: 'attendance', element: <AttendancePage /> },
        { path: 'attendance/history', element: <AttendanceHistoryPage /> },
        { path: 'records', element: <RecordsPage /> },
        { path: 'finances', element: <FinancesPage /> },
        { path: 'reports', element: <ReportsPage /> },
        { path: 'reports/driver', element: <DriverReportPage /> },
        { path: 'reports/students', element: <ReportPlaceholderPage title="Student Reports" /> },
        { path: 'reports/attendance', element: <ReportPlaceholderPage title="Attendance Reports" /> },
        { path: 'reports/revenue', element: <ReportPlaceholderPage title="Revenue Reports" /> },
        { path: 'reports/expenses', element: <ReportPlaceholderPage title="Expense Reports" /> },
        { path: 'reports/schedule', element: <ReportPlaceholderPage title="Schedule Reports" /> },
        { path: 'staff', element: <StaffPage /> },
        { path: 'staff/:id', element: <StaffProfilePage /> },
        { path: 'audit-log', element: <AuditLogPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
  ],
}

export default managerRoutes
