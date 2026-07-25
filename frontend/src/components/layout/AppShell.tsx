import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const { role } = useAuth()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  // ProtectedRoute guarantees a signed-in user by the time AppShell mounts.
  if (!role) return null

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <Sidebar role={role} />
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
