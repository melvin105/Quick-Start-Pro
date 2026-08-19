import { Users, ClipboardCheck, Wallet, BarChart3, CalendarClock, Car } from 'lucide-react'
import ReportCard from '../../features/reports/ReportCard'
import { ROUTES } from '../../lib/constants'

const REPORTS = [
  { icon: Users,          iconClass: 'bg-brand-50 text-brand-600',   title: 'Student Reports',    description: 'Enrolment, retention & package breakdowns', to: '/manager/reports/students' },
  { icon: ClipboardCheck, iconClass: 'bg-success-bg text-success',   title: 'Attendance Reports', description: 'Lesson attendance by student & instructor', to: '/manager/reports/attendance' },
  { icon: Wallet,         iconClass: 'bg-warning-bg text-warning',   title: 'Revenue Reports',    description: 'Income by period, package & method',        to: '/manager/reports/revenue' },
  { icon: BarChart3,      iconClass: 'bg-danger-bg text-danger',     title: 'Expense Reports',    description: 'Spending by category & vendor',              to: '/manager/reports/expenses' },
  { icon: CalendarClock,  iconClass: 'bg-brand-50 text-brand-600',   title: 'Schedule Reports',   description: 'Lesson volume & instructor utilisation',     to: '/manager/reports/schedule' },
  { icon: Car,            iconClass: 'bg-gray-100 text-gray-700',    title: 'Driver Report',      description: 'Lessons per instructor by date range',       to: ROUTES.REPORTS_DRIVER },
]

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[12px] text-gray-500">Dashboard / Reports</p>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Reports</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((r) => <ReportCard key={r.title} {...r} />)}
      </div>
    </div>
  )
}
