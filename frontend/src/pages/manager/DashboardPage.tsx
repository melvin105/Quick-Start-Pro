import { useAuth } from '../../features/auth/useAuth'
import { ROLES } from '../../lib/constants'
import SecretaryDashboard from '../../features/dashboard/secretary/SecretaryDashboard'
import ManagerDashboard from '../../features/dashboard/manager/ManagerDashboard'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user, role } = useAuth()
  const firstName = user?.name.split(' ')[0] ?? ''
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{today}</p>
      </div>

      {role === ROLES.ADMIN ? <ManagerDashboard /> : <SecretaryDashboard />}
    </div>
  )
}
