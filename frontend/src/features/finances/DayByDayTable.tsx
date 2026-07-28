import { useNavigate } from 'react-router-dom'
import useRecordsStore from '../records/shared/store'
import usePaymentsStore from '../payments/store'
import { computeDayTotals, formatDayShort } from '../records/shared/utils'
import { formatGHS } from '../payments/utils'
import { ROUTES } from '../../lib/constants'
import { eachDateInRange, type PeriodRange } from './period'
import type { DayStatus } from '../records/shared/types'

interface RowMeta {
  label:     string
  badge?:    string
  action?:   string
}

function rowMeta(status: DayStatus, hasActivity: boolean): RowMeta {
  if (!hasActivity) return { label: '—' }
  if (status === 'submitted') return { label: 'Pending', badge: 'bg-warning-bg text-warning', action: 'Review →' }
  if (status === 'approved')  return { label: 'Closed',  badge: 'bg-success-bg text-success', action: 'View →' }
  if (status === 'flagged')   return { label: 'Flagged', badge: 'bg-warning-bg text-warning', action: 'View →' }
  return { label: 'Live', badge: 'bg-gray-100 text-gray-600', action: 'View →' }
}

interface DayByDayTableProps {
  range: PeriodRange
}

export default function DayByDayTable({ range }: DayByDayTableProps) {
  const navigate = useNavigate()
  const days = useRecordsStore((s) => s.days)
  const expenses = useRecordsStore((s) => s.expenses)
  const paymentRecords = usePaymentsStore((s) => s.records)

  const rows = eachDateInRange(range)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => {
      const record = days.find((d) => d.date === date)
      const status: DayStatus = record?.status ?? 'open'
      const { totalIncome, totalExpense } = computeDayTotals(date, expenses, paymentRecords)
      const hasActivity = status !== 'open' || totalIncome > 0 || totalExpense > 0
      return { date, status, totalIncome, totalExpense, net: totalIncome - totalExpense, hasActivity }
    })

  const handleClick = (row: (typeof rows)[number]) => {
    if (!row.hasActivity) return
    navigate(`${ROUTES.RECORDS}?date=${row.date}`)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {['Date', 'Income', 'Expenses', 'Net', 'Status', 'Action'].map((col) => (
                <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const meta = rowMeta(row.status, row.hasActivity)
              return (
                <tr
                  key={row.date}
                  onClick={() => handleClick(row)}
                  className={`border-b border-gray-100 last:border-0 transition-colors ${
                    row.hasActivity ? 'cursor-pointer hover:bg-gray-50' : ''
                  } ${row.status === 'submitted' ? 'bg-warning-bg/30' : ''}`}
                >
                  <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{formatDayShort(row.date)}</td>
                  {row.hasActivity ? (
                    <>
                      <td className="px-4 py-3 text-[13px] text-success font-medium whitespace-nowrap">{formatGHS(row.totalIncome)}</td>
                      <td className="px-4 py-3 text-[13px] text-danger font-medium whitespace-nowrap">{formatGHS(row.totalExpense)}</td>
                      <td className="px-4 py-3 text-[13px] font-semibold text-gray-900 whitespace-nowrap">{formatGHS(row.net)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-[13px] text-gray-400 whitespace-nowrap">—</td>
                      <td className="px-4 py-3 text-[13px] text-gray-400 whitespace-nowrap">—</td>
                      <td className="px-4 py-3 text-[13px] text-gray-400 whitespace-nowrap">—</td>
                    </>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {meta.badge ? (
                      <span className={`inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${meta.badge}`}>
                        {meta.label}
                      </span>
                    ) : (
                      <span className="text-[12px] text-gray-400">no activity</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12.5px] font-medium text-brand-600 whitespace-nowrap">
                    {meta.action ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
