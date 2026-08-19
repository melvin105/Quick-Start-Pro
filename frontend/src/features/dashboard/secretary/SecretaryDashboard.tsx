import StatCard from '../../../components/ui/StatCard'
import LoadingState from '../../../components/ui/LoadingState'
import ErrorState from '../../../components/ui/ErrorState'
import TodaysSchedule from './TodaysSchedule'
import ActivityFeed, { type ActivityItem } from '../manager/ActivityFeed'
import { getDashboard } from '../dashboardService'
import { useApiResource } from '../../../lib/useApiResource'
import { formatCount, formatGHS, toTodaysSchedule } from '../dashboardPresenters'

// Recent-activity has no dashboard endpoint yet (GET /dashboard returns stats,
// upcoming lessons, and today's attendance only). Rather than seed fake rows,
// the feed renders an honest empty state until a backend activity source exists
// (tracked as a #123 backend dependency).
const ACTIVITY: ActivityItem[] = []

export default function SecretaryDashboard() {
  const { data, loading, error, refetch } = useApiResource(getDashboard)

  if (loading) return <LoadingState message="Loading dashboard…" />
  if (error)   return <ErrorState error={error} onRetry={refetch} />
  if (!data)   return null

  const { stats, upcomingLessons, todaysAttendance } = data

  const todaysSchedule = toTodaysSchedule(upcomingLessons)
  const todaysLessonCount = todaysAttendance.length
  const remaining = todaysAttendance.filter((a) => !a.check_in_time).length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Students"
          value={formatCount(stats.total_students)}
          delta={{ text: `${formatCount(stats.active_students)} active`, tone: 'neutral' }}
        />
        <StatCard
          label="Today's Lessons"
          value={formatCount(todaysLessonCount)}
          delta={{ text: `${formatCount(remaining)} remaining`, tone: 'neutral' }}
        />
        <StatCard
          label="Outstanding"
          value={formatGHS(stats.outstanding_balances)}
          tone="warning"
        />
        <StatCard
          label="Licences Issued"
          value={formatCount(stats.licences_issued)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TodaysSchedule items={todaysSchedule} />
        <ActivityFeed items={ACTIVITY} />
      </div>
    </div>
  )
}
