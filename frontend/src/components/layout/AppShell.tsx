import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const SIDEBAR_COLLAPSED_KEY = 'qsp-sidebar-collapsed'

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

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

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
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:block shrink-0 transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
        <Sidebar role={role} collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
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
          <Sidebar role={role} onNavigate={() => setMobileNavOpen(false)} />
        </aside>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
