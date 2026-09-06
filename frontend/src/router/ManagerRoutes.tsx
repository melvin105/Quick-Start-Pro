/* eslint-disable react-refresh/only-export-components -- route configuration owns lazy component references */
import { lazy, Suspense, type ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AppShell from '../components/layout/AppShell'
import LoadingState from '../components/ui/LoadingState'
import { ROLES } from '../lib/constants'

const DashboardPage = lazy(() => import('../pages/manager/DashboardPage'))
const StudentsPage = lazy(() => import('../pages/manager/StudentsPage'))
const StudentProfilePage = lazy(() => import('../pages/manager/StudentProfilePage'))
const SchedulePage = lazy(() => import('../pages/manager/SchedulePage'))
const UnscheduledStudentsPage = lazy(() => import('../features/scheduling/shared/UnscheduledStudentsPage'))
const AttendancePage = lazy(() => import('../pages/manager/AttendancePage'))
const AttendanceHistoryPage = lazy(() => import('../pages/manager/AttendanceHistoryPage'))
const RecordsPage = lazy(() => import('../pages/manager/RecordsPage'))
const FinancesPage = lazy(() => import('../pages/manager/FinancesPage'))
const ReportsPage = lazy(() => import('../pages/manager/ReportsPage'))
const DriverReportPage = lazy(() => import('../pages/manager/reports/DriverReportPage'))
const LiveReportPage = lazy(() => import('../features/reports/LiveReportPage'))
const StaffPage = lazy(() => import('../pages/manager/StaffPage'))
const StaffProfilePage = lazy(() => import('../pages/manager/StaffProfilePage'))
const AuditLogPage = lazy(() => import('../pages/manager/AuditLogPage'))
const SettingsPage = lazy(() => import('../pages/manager/SettingsPage'))
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage'))

function loadRoute(element: ReactNode) {
  return <Suspense fallback={<LoadingState message="Loading pageâ€¦" />}>{element}</Suspense>
}

// role !== 'manager' redirects to /secretary/dashboard (ProtectedRoute -> ROUTES.DASHBOARD
// resolves per the signed-in user's own role).
const managerRoutes: RouteObject = {
  path: 'manager',
  element: <ProtectedRoute roles={[ROLES.MANAGER]} />,
  children: [
    {
      element: <AppShell />,
      children: [
        { path: 'dashboard', element: loadRoute(<DashboardPage />) },
        { path: 'students', element: loadRoute(<StudentsPage />) },
        { path: 'students/:id', element: loadRoute(<StudentProfilePage />) },
        { path: 'schedule', element: loadRoute(<SchedulePage />) },
        { path: 'schedule/unscheduled', element: loadRoute(<UnscheduledStudentsPage />) },
        { path: 'attendance', element: loadRoute(<AttendancePage />) },
        { path: 'attendance/history', element: loadRoute(<AttendanceHistoryPage />) },
        { path: 'records', element: loadRoute(<RecordsPage />) },
        { path: 'finances', element: loadRoute(<FinancesPage />) },
        { path: 'reports', element: loadRoute(<ReportsPage />) },
        { path: 'reports/driver', element: loadRoute(<DriverReportPage />) },
        { path: 'reports/students', element: loadRoute(<LiveReportPage kind="students" />) },
        { path: 'reports/attendance', element: loadRoute(<LiveReportPage kind="attendance" />) },
        { path: 'reports/revenue', element: loadRoute(<LiveReportPage kind="revenue" />) },
        { path: 'reports/expenses', element: loadRoute(<LiveReportPage kind="expenses" />) },
        { path: 'reports/licences', element: loadRoute(<LiveReportPage kind="licences" />) },
        { path: 'staff', element: loadRoute(<StaffPage />) },
        { path: 'staff/:id', element: loadRoute(<StaffProfilePage />) },
        { path: 'audit-log', element: loadRoute(<AuditLogPage />) },
        { path: 'settings', element: loadRoute(<SettingsPage />) },
        { path: 'notifications', element: loadRoute(<NotificationsPage />) },
      ],
    },
  ],
}

export default managerRoutes
