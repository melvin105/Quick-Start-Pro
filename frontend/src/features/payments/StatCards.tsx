import { formatGHS } from './utils'

interface StatCardsProps {
  todayIncome: number
  monthIncome: number
  outstanding: number
  studentsWithBalance: number
}

export default function StatCards({ todayIncome, monthIncome, outstanding, studentsWithBalance }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-[12px] text-gray-500">Today's Income</p>
        <p className="text-xl font-semibold text-gray-900 mt-1">{formatGHS(todayIncome)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-[12px] text-gray-500">This Month</p>
        <p className="text-xl font-semibold text-gray-900 mt-1">{formatGHS(monthIncome)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-[12px] text-gray-500">Outstanding</p>
        <p className="text-xl font-semibold text-danger mt-1">{formatGHS(outstanding)}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-[12px] text-gray-500">Students with Balance</p>
        <p className="text-xl font-semibold text-gray-900 mt-1">{studentsWithBalance}</p>
      </div>
    </div>
  )
}
