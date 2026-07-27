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
import StaffPage from '../pages/manager/StaffPage'
import AuditLogPage from '../pages/manager/AuditLogPage'
import SettingsPage from '../pages/manager/SettingsPage'

// role !== 'admin' redirects to /secretary/dashboard (ProtectedRoute -> ROUTES.DASHBOARD
// resolves per the signed-in user's own role).
const managerRoutes: RouteObject = {
  path: 'manager',
  element: <ProtectedRoute roles={[ROLES.ADMIN]} />,
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
        { path: 'staff', element: <StaffPage /> },
        { path: 'audit-log', element: <AuditLogPage /> },
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
  ],
}

export default managerRoutes
