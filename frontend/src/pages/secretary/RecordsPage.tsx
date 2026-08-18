import { useMemo, useState } from 'react'
import { Check, Flag, Plus } from 'lucide-react'
import RecordsLedgerTable from '../../features/records/secretary/RecordsLedgerTable'
import RecordsLedgerCardList from '../../features/records/secretary/RecordsLedgerCardList'
import RecordExpenseModal from '../../features/records/secretary/RecordExpenseModal'
import EndOfDaySummaryModal from '../../features/records/secretary/EndOfDaySummaryModal'
import DayStatusBadge from '../../features/records/secretary/DayStatusBadge'
import DatePicker from '../../components/ui/DatePicker'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import { useApiResource } from '../../lib/useApiResource'
import { deleteExpense, getDailyRecords, submitEndOfDay } from '../../features/records/shared/recordsService'
import { toDayRecord, toExpenseEntry, toLedgerRow } from '../../features/records/shared/recordsMappers'
import { formatDateWithWeekday } from '../../features/records/shared/utils'
import { formatGHS, todayIso } from '../../features/payments/utils'
import type { ExpenseEntry } from '../../features/records/shared/types'

export default function RecordsPage() {
  const [selectedDate, setSelectedDate] = useState(todayIso())
  const { data, loading, error, refetch } = useApiResource(
    () => getDailyRecords(selectedDate),
    [selectedDate],
  )

  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null)
  const [showEodModal, setShowEodModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [submittingDay, setSubmittingDay] = useState(false)

  const day = useMemo(() => data ? toDayRecord(data.closure) : null, [data])
  const rows = useMemo(() => data?.ledger.map(toLedgerRow) ?? [], [data])
  const expenses = useMemo(
    () => data?.ledger.map(toExpenseEntry).filter((entry): entry is ExpenseEntry => entry !== null) ?? [],
    [data],
  )
  const incomeRows = useMemo(() => rows.filter((row) => row.type === 'income'), [rows])
  const expenseRows = useMemo(() => rows.filter((row) => row.type === 'expense'), [rows])
  const totalIncome = incomeRows.reduce((sum, row) => sum + row.amount, 0)
  const totalExpense = expenseRows.reduce((sum, row) => sum + row.amount, 0)
  const closingBalance = (day?.openingBalance ?? 0) + totalIncome - totalExpense
  const isToday = selectedDate === todayIso()
  const canEdit = Boolean(day && (day.status === 'flagged' || (day.status === 'open' && isToday)))
  const canSubmit = canEdit && rows.length > 0

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const openAddExpense = () => {
    setEditingExpense(null)
    setActionError(null)
    setShowExpenseModal(true)
  }

  const openEditExpense = (id: string) => {
    const entry = expenses.find((expense) => expense.id === id)
    if (entry) {
      setEditingExpense(entry)
      setActionError(null)
      setShowExpenseModal(true)
    }
  }

  const handleDelete = async (id: string) => {
    setActionError(null)
    try {
      await deleteExpense(id)
      await refetch()
      showToast('Expense deleted')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'The expense could not be deleted.')
    }
  }

  const handleExpenseSaved = async (entry: ExpenseEntry) => {
    setShowExpenseModal(false)
    await refetch()
    showToast(editingExpense ? 'Expense updated' : `Expense recorded — ${entry.id}`)
  }

  const handleSubmitDay = async () => {
    setSubmittingDay(true)
    setActionError(null)
    try {
      await submitEndOfDay(selectedDate)
      await refetch()
      setShowEodModal(false)
      showToast('End of day submitted to manager')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'The day could not be submitted.')
      setShowEodModal(false)
    } finally {
      setSubmittingDay(false)
    }
  }

  if (loading) return <LoadingState message="Loading daily records…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!day) return null

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Records</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Records</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{formatDateWithWeekday(selectedDate)}</p>
        </div>
        {canEdit && (
          <button type="button" onClick={openAddExpense} className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
            <Plus size={15} /> Record Expense
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <DatePicker value={selectedDate} onChange={setSelectedDate} maxDate={todayIso()} />
        <DayStatusBadge status={day.status} />
        <p className="text-[12.5px] text-gray-500">
          Opening Balance: <span className="font-medium text-gray-800">{formatGHS(day.openingBalance)}</span>
          <span className="text-gray-400"> (carried from the latest approved close)</span>
        </p>
      </div>

      {actionError && (
        <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-[13px] text-danger" role="alert">
          {actionError}
        </div>
      )}

      <RecordsLedgerTable rows={rows} editable={canEdit} totalIncome={totalIncome} totalExpense={totalExpense} onEdit={openEditExpense} onDelete={(id) => void handleDelete(id)} />
      <RecordsLedgerCardList rows={rows} />

      {day.status === 'flagged' && (
        <div className="bg-warning-bg border border-warning/30 rounded-2xl p-4 flex items-start gap-2.5">
          <Flag size={15} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-warning">Flagged by {day.reviewedBy ?? 'Manager'}</p>
            <p className="text-[13px] text-gray-700 mt-0.5">{day.flagNote}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[14px] text-gray-800">
          Closing Balance (so far): <span className="font-semibold text-gray-900">{formatGHS(closingBalance)}</span>
        </p>
        <div className="hidden md:block">
          {day.status === 'open' || day.status === 'flagged' ? (
            <button type="button" disabled={!canSubmit || submittingDay} onClick={() => setShowEodModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors">
              {day.status === 'flagged' ? 'Resubmit End of Day' : 'Submit End of Day'} →
            </button>
          ) : (
            <span className={`px-4 py-2 text-[13px] font-medium rounded-lg ${day.status === 'approved' ? 'bg-success-bg text-success' : 'bg-gray-100 text-gray-500'}`}>
              {day.status === 'approved' ? 'Approved ✓' : 'Submitted — locked ✓'}
            </span>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-30 flex items-center gap-2">
          <button type="button" onClick={openAddExpense} className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white border border-gray-200 text-gray-800 font-medium text-[13.5px] rounded-xl shadow-modal">
            <Plus size={15} /> Expense
          </button>
          <button type="button" disabled={!canSubmit} onClick={() => setShowEodModal(true)} className="flex-[1.4] flex items-center justify-center py-3 bg-brand-600 disabled:opacity-40 text-white font-semibold text-[13.5px] rounded-xl shadow-modal">
            Submit EOD →
          </button>
        </div>
      )}

      {showExpenseModal && (
        <RecordExpenseModal date={selectedDate} editing={editingExpense ?? undefined} onClose={() => setShowExpenseModal(false)} onSaved={(entry) => void handleExpenseSaved(entry)} />
      )}

      {showEodModal && (
        <EndOfDaySummaryModal
          date={selectedDate}
          openingBalance={day.openingBalance}
          incomeRows={incomeRows}
          expenseRows={expenseRows}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          closingBalance={closingBalance}
          preparedBy="Secretary"
          onClose={() => setShowEodModal(false)}
          onSubmit={() => void handleSubmitDay()}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <Check size={15} className="text-success" />{toast}
        </div>
      )}
    </div>
  )
}
