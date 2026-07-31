import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import useAttendanceStore from '../../features/attendance/shared/store'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import TopBrandBar from './TopBrandBar'

const SIDEBAR_COLLAPSED_KEY = 'qsp-sidebar-collapsed'
const AUTO_ABSENT_SWEEP_INTERVAL_MS = 60_000

function readStoredCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  } catch {
    return false
  }
}

export default function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readStoredCollapsed)
  const location = useLocation()
  const { role } = useAuth()
  const autoMarkOverdue = useAttendanceStore((s) => s.autoMarkOverdue)
  const syncFromSchedule = useAttendanceStore((s) => s.syncFromSchedule)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  // The 60-minute no-show rule is a standing system rule, not something tied
  // to whoever happens to be viewing the Attendance page — run it here so it
  // applies regardless of which screen is open. Scheduling a student today
  // doesn't itself create an attendance row, so syncFromSchedule keeps the
  // two in step the same way.
  useEffect(() => {
    autoMarkOverdue()
    syncFromSchedule()
    const interval = setInterval(() => {
      autoMarkOverdue()
      syncFromSchedule()
    }, AUTO_ABSENT_SWEEP_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [autoMarkOverdue, syncFromSchedule])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      } catch {
        // Storage can be unavailable (private browsing); collapse still works for this session.
      }
      return next
    })
  }

  // ProtectedRoute guarantees a signed-in user by the time AppShell mounts.
  if (!role) return null

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex shrink-0 border-b border-gray-200 bg-white">
        <TopBrandBar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onOpenMobileMenu={() => setMobileNavOpen(true)}
        />
        <div className="flex-1 min-w-0">
          <Topbar />
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Desktop sidebar */}
        <aside className={`hidden lg:block shrink-0 transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
          <Sidebar role={role} collapsed={collapsed} />
        </aside>

        {/* Mobile / tablet drawer */}
        <div
          className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 ${
            mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside
            className={`absolute inset-y-0 left-0 w-72 max-w-[80%] shadow-modal transition-transform duration-200 ${
              mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar role={role} onNavigate={() => setMobileNavOpen(false)} showHeader />
          </aside>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
