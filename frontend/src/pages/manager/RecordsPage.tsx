import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import RecordsDateNav from '../../features/records/manager/RecordsDateNav'
import LiveDayView from '../../features/records/manager/LiveDayView'
import ReviewDayView from '../../features/records/manager/ReviewDayView'
import { approveEndOfDay, getDailyRecords, rejectEndOfDay } from '../../features/records/shared/recordsService'
import { toDayRecord, toLedgerRow } from '../../features/records/shared/recordsMappers'
import { useApiResource } from '../../lib/useApiResource'
import { toApiError } from '../../lib/apiError'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function RecordsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [toast, setToast] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<ReturnType<typeof toApiError> | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedDate = searchParams.get('date') || todayIso()
  const { data, loading, error, refetch } = useApiResource(
    () => getDailyRecords(selectedDate),
    [selectedDate],
  )

  const handleDateChange = (date: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('date', date)
      return next
    })
  }

  const day = data ? toDayRecord(data.closure) : null
  const rows = data?.ledger.map(toLedgerRow) ?? []
  const incomeRows = rows.filter((r) => r.type === 'income')
  const expenseRows = rows.filter((r) => r.type === 'expense')
  const totalIncome = incomeRows.reduce((sum, row) => sum + row.amount, 0)
  const totalExpense = expenseRows.reduce((sum, row) => sum + row.amount, 0)
  const closingBalance = (day?.openingBalance ?? 0) + totalIncome - totalExpense
  const noActivity = day?.status === 'open' && rows.length === 0

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const runMutation = async (mutation: () => Promise<unknown>, message: string) => {
    setSaving(true)
    setMutationError(null)
    try {
      await mutation()
      await refetch()
      showToast(message)
    } catch (err) {
      setMutationError(toApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = () => runMutation(() => approveEndOfDay(selectedDate), 'Day closed.')
  const handleRequestCorrection = (note: string) =>
    runMutation(() => rejectEndOfDay(selectedDate, note), 'Correction requested.')

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[12px] text-gray-500">Dashboard / Records</p>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Records</h1>
      </div>

      <RecordsDateNav
        date={selectedDate}
        onChange={handleDateChange}
        submittedBy={day?.submittedBy}
        submittedAt={day?.submittedAt}
      />

      {loading && <LoadingState message="Loading daily records…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {mutationError && <ErrorState error={mutationError} />}

      {!loading && !error && day && (noActivity ? (
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
          onApprove={() => { if (!saving) void handleApprove() }}
          onRequestCorrection={(note) => { if (!saving) void handleRequestCorrection(note) }}
        />
      ))}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <Check size={15} className="text-success" />
          {toast}
        </div>
      )}
    </div>
  )
}
