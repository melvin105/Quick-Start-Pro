import StatCard from '../../../components/ui/StatCard'
import RevenueExpenseChart from '../../finances/RevenueExpenseChart'
import { CURRENT_MONTH, PREVIOUS_MONTH, OUTSTANDING, netProfit, pctDeltaLabel } from '../../finances/mockData'
import PendingApprovals, { type ApprovalItem } from './PendingApprovals'
import WeekAtAGlance from '../secretary/WeekAtAGlance'

const APPROVALS: ApprovalItem[] = [
  { date: 'Wed, 16 Jul', text: 'Instructor payment — GHS 3,500' },
  { date: 'Tue, 15 Jul', text: 'Equipment purchase — GHS 2,700' },
]

const currentNet = netProfit(CURRENT_MONTH)
const previousNet = netProfit(PREVIOUS_MONTH)

export default function ManagerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`Revenue (${CURRENT_MONTH.month})`} value={`GHS ${CURRENT_MONTH.revenue.toLocaleString()}`} />
        <StatCard label={`Expenses (${CURRENT_MONTH.month})`} value={`GHS ${CURRENT_MONTH.expenses.toLocaleString()}`} />
        <StatCard
          label={`Net Profit (${CURRENT_MONTH.month})`}
          value={`GHS ${currentNet.toLocaleString()}`}
          tone="positive"
          delta={{ text: pctDeltaLabel(currentNet, previousNet), tone: 'positive' }}
        />
        <StatCard
          label="Outstanding"
          value={`GHS ${OUTSTANDING.amount.toLocaleString()}`}
          tone="warning"
          delta={{ text: `${OUTSTANDING.studentsOwing} students`, tone: 'warning' }}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Students" value="18" />
        <StatCard label="New This Month" value="4" />
        <StatCard label="Lessons Today" value="9" />
        <StatCard label="Overdue > 7 days" value="3 students" delta={{ text: 'GHS 1,200 owed', tone: 'warning' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2">
          <RevenueExpenseChart />
        </div>
        <PendingApprovals items={APPROVALS} />
      </div>

      <WeekAtAGlance />
    </div>
  )
}
