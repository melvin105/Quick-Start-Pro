import ManagerLedgerTable from './ManagerLedgerTable'
import { formatDateWithWeekday } from '../shared/utils'
import { formatGHS } from '../../payments/utils'
import type { LedgerRow } from '../shared/types'

interface LiveDayViewProps {
  date:            string
  openingBalance:  number
  rows:            LedgerRow[]
  closingBalance:  number
}

export default function LiveDayView({ date, openingBalance, rows, closingBalance }: LiveDayViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[15px] font-semibold text-gray-900">Daily Records (Read Only)</h2>
        <p className="text-[12.5px] text-gray-500">{formatDateWithWeekday(date)}</p>
        <p className="text-[13px] text-gray-700 mt-2">
          Opening Balance: <span className="font-medium text-gray-900">{formatGHS(openingBalance)}</span>
        </p>
      </div>

      <ManagerLedgerTable rows={rows} />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[14px] text-gray-800">
          Closing Balance (live): <span className="font-semibold text-gray-900">{formatGHS(closingBalance)}</span>
        </p>
        <button
          type="button"
          disabled
          className="px-4 py-2 text-[13px] font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
        >
          Awaiting Secretary Submission
        </button>
      </div>
    </div>
  )
}
