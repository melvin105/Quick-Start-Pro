import StatCard from '../../../components/ui/StatCard'
import LoadingState from '../../../components/ui/LoadingState'
import ErrorState from '../../../components/ui/ErrorState'
import MonthlyRevenueChart from './MonthlyRevenueChart'
import PendingApprovals, { type ApprovalItem } from './PendingApprovals'
import WeekAtAGlance from '../secretary/WeekAtAGlance'
import { getDashboard } from '../dashboardService'
import { getPendingRegistrations, type Registration } from '../../registrations/registrationService'
import { useApiResource } from '../../../lib/useApiResource'
import {
  formatCount,
  formatGHS,
  formatMonthLabel,
  formatSubmittedDate,
  toRevenueSeries,
  monthlyRevenueDelta,
  deltaLabel,
  netProfit,
  toWeekCounts,
} from '../dashboardPresenters'

function toApprovalItem(reg: Registration): ApprovalItem {
  return {
    id:     reg.id,
    name:   `${reg.first_name} ${reg.last_name}`.trim(),
    detail: 'New student registration',
    date:   formatSubmittedDate(reg.submitted_at),
  }
}

export default function ManagerDashboard() {
  const { data, loading, error, refetch } = useApiResource(getDashboard)
  const approvals = useApiResource(getPendingRegistrations)

  if (loading) return <LoadingState message="Loading dashboard…" />
  if (error)   return <ErrorState error={error} onRetry={refetch} />
  if (!data)   return null

  const { stats, upcomingLessons, monthlyRevenue = [] } = data

  const revenue = stats.revenue_this_month ?? 0
  const expenses = stats.expenses_this_month ?? 0
  const net = netProfit(revenue, expenses)

  const monthLabel = formatMonthLabel(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  )

  const revenueSeries = toRevenueSeries(monthlyRevenue)
  const revDeltaPct = monthlyRevenueDelta(monthlyRevenue)
  const revenueDelta = revDeltaPct === null
    ? undefined
    : { text: deltaLabel(revDeltaPct), tone: revDeltaPct >= 0 ? ('positive' as const) : ('negative' as const) }

  const weekCounts = toWeekCounts(upcomingLessons)
  const approvalItems = (approvals.data ?? []).map(toApprovalItem)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`Revenue (${monthLabel})`} value={formatGHS(revenue)} delta={revenueDelta} />
        <StatCard label={`Expenses (${monthLabel})`} value={formatGHS(expenses)} />
        <StatCard
          label={`Net Profit (${monthLabel})`}
          value={formatGHS(net)}
          tone={net >= 0 ? 'positive' : 'default'}
        />
        <StatCard label="Outstanding" value={formatGHS(stats.outstanding_balances)} tone="warning" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Students" value={formatCount(stats.active_students)} />
        <StatCard label="Total Students" value={formatCount(stats.total_students)} />
        <StatCard label="Lessons Completed" value={formatCount(stats.lessons_completed)} />
        <StatCard label="Licences Issued" value={formatCount(stats.licences_issued)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2">
          <MonthlyRevenueChart data={revenueSeries} />
        </div>
        <PendingApprovals
          items={approvalItems}
          loading={approvals.loading}
          error={approvals.error}
          onRetry={approvals.refetch}
        />
      </div>

      <WeekAtAGlance days={weekCounts} />
    </div>
  )
}
