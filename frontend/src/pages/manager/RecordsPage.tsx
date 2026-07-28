import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import useRecordsStore from '../../features/records/shared/store'
import usePaymentsStore from '../../features/payments/store'
import RecordsDateNav from '../../features/records/manager/RecordsDateNav'
import LiveDayView from '../../features/records/manager/LiveDayView'
import ReviewDayView from '../../features/records/manager/ReviewDayView'
import { computeDay, computeDayTotals, buildLedgerRows } from '../../features/records/shared/utils'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function RecordsPage() {
  const { user } = useAuth()
  const reviewerName = user?.name ?? 'Manager'

  const [searchParams, setSearchParams] = useSearchParams()
  const days = useRecordsStore((s) => s.days)
  const expenses = useRecordsStore((s) => s.expenses)
  const approveDay = useRecordsStore((s) => s.approveDay)
  const flagDay = useRecordsStore((s) => s.flagDay)
  const paymentRecords = usePaymentsStore((s) => s.records)

  const [toast, setToast] = useState<string | null>(null)

  const selectedDate = searchParams.get('date') || todayIso()

  const handleDateChange = (date: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('date', date)
      return next
    })
  }

  const day = computeDay(selectedDate, days, expenses, paymentRecords)
  const rows = buildLedgerRows(selectedDate, expenses, paymentRecords)
  const incomeRows = rows.filter((r) => r.type === 'income')
  const expenseRows = rows.filter((r) => r.type === 'expense')
  const { totalIncome, totalExpense } = computeDayTotals(selectedDate, expenses, paymentRecords)
  const closingBalance = day.openingBalance + totalIncome - totalExpense
  const noActivity = day.status === 'open' && rows.length === 0

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = () => {
    approveDay(selectedDate, reviewerName)
    showToast('Day closed.')
  }

  const handleRequestCorrection = (note: string) => {
    flagDay(selectedDate, reviewerName, note)
    showToast('Correction requested.')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[12px] text-gray-500">Dashboard / Records</p>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Records</h1>
      </div>

      <RecordsDateNav
        date={selectedDate}
        onChange={handleDateChange}
        submittedBy={day.submittedBy}
        submittedAt={day.submittedAt}
      />

      {noActivity ? (
        <div className="py-24 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No activity recorded for this day.
        </div>
      ) : day.status === 'open' ? (
        <LiveDayView date={selectedDate} openingBalance={day.openingBalance} rows={rows} closingBalance={closingBalance} />
      ) : (
        <ReviewDayView
          date={selectedDate}
          day={day}
          incomeRows={incomeRows}
          expenseRows={expenseRows}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          closingBalance={closingBalance}
          onApprove={handleApprove}
          onRequestCorrection={handleRequestCorrection}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <Check size={15} className="text-success" />
          {toast}
        </div>
      )}
    </div>
  )
}
