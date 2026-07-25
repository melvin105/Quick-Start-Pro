import StatCard from './StatCard'
import RevenueExpenseChart from './RevenueExpenseChart'
import PendingApprovals, { type ApprovalItem } from './PendingApprovals'
import WeekAtAGlance from './WeekAtAGlance'

const APPROVALS: ApprovalItem[] = [
  { date: 'Wed, 16 Jul', text: 'Instructor payment — GHS 3,500' },
  { date: 'Tue, 15 Jul', text: 'Equipment purchase — GHS 2,700' },
]

export default function ManagerDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue (Jul)" value="GHS 18,200" />
        <StatCard label="Expenses (Jul)" value="GHS 9,580" />
        <StatCard label="Net Profit (Jul)" value="GHS 8,840" tone="positive" delta={{ text: '+12% vs last month', tone: 'positive' }} />
        <StatCard label="Outstanding" value="GHS 5,200" tone="warning" delta={{ text: '6 students', tone: 'warning' }} />
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
