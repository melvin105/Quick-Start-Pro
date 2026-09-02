import StatCard from '../../../components/ui/StatCard'
import PageDataSkeleton from '../../../components/ui/PageDataSkeleton'
import ErrorState from '../../../components/ui/ErrorState'
import TodaysSchedule from './TodaysSchedule'
import ActivityFeed from '../manager/ActivityFeed'
import { getDashboard } from '../dashboardService'
import { useApiResource } from '../../../lib/useApiResource'
import { formatCount, formatGHS, toActivityFeed, toTodaysSchedule } from '../dashboardPresenters'

export default function SecretaryDashboard() {
  const { data, loading, error, refetch } = useApiResource(
    getDashboard,
    [],
    { cacheKey: 'dashboard', staleTime: 30_000 },
  )

  if (loading) return <PageDataSkeleton panels={2} />
  if (error)   return <ErrorState error={error} onRetry={refetch} />
  if (!data)   return null

  const { stats, todaysAttendance, recentActivity } = data

  const todaysSchedule = toTodaysSchedule(todaysAttendance)
  const activity = toActivityFeed(recentActivity ?? [])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Students"
          value={formatCount(stats.total_students)}
          delta={{ text: `${formatCount(stats.active_students)} active`, tone: 'neutral' }}
        />
        <StatCard
          label="Payments Recorded"
          value={formatCount(stats.payments_recorded_today)}
          delta={{ text: `${formatGHS(stats.payments_recorded_today_total)} today`, tone: 'neutral' }}
        />
        <StatCard
          label="Outstanding"
          value={formatGHS(stats.outstanding_balances)}
          tone="warning"
          delta={{ text: `${formatCount(stats.students_with_balance)} students`, tone: 'warning' }}
        />
        <StatCard
          label="Licences Issued"
          value={formatCount(stats.licences_issued)}
          delta={{ text: `${formatCount(stats.licences_in_progress)} in progress`, tone: 'neutral' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodaysSchedule items={todaysSchedule} />
        <ActivityFeed items={activity} />
      </div>
    </div>
  )
}
