import { useMemo, useState } from 'react'
import { Plus, Check, Flag } from 'lucide-react'
import { ROLES } from '../../lib/constants'
import { useAuth } from '../../features/auth/useAuth'
import useRecordsStore from '../../features/records/shared/store'
import usePaymentsStore from '../../features/payments/store'
import RecordsLedgerTable from '../../features/records/secretary/RecordsLedgerTable'
import RecordsLedgerCardList from '../../features/records/secretary/RecordsLedgerCardList'
import RecordExpenseModal from '../../features/records/secretary/RecordExpenseModal'
import EndOfDaySummaryModal from '../../features/records/secretary/EndOfDaySummaryModal'
import ReviewPanel from '../../features/records/manager/ReviewPanel'
import DayStatusBadge from '../../features/records/secretary/DayStatusBadge'
import DatePicker from '../../components/ui/DatePicker'
import { computeDay, formatDateWithWeekday } from '../../features/records/shared/utils'
import { formatGHS, todayIso } from '../../features/payments/utils'
import type { ExpenseEntry, LedgerRow } from '../../features/records/shared/types'

export default function RecordsPage() {
  const { role, user } = useAuth()
  const isManager = role === ROLES.MANAGER
  const displayName = user?.name ?? 'Secretary'

  const [selectedDate, setSelectedDate] = useState(todayIso())
  const days = useRecordsStore((s) => s.days)
  const expenses = useRecordsStore((s) => s.expenses)
  const deleteExpense = useRecordsStore((s) => s.deleteExpense)
  const submitDay = useRecordsStore((s) => s.submitDay)
  const approveDay = useRecordsStore((s) => s.approveDay)
  const flagDay = useRecordsStore((s) => s.flagDay)
  const paymentRecords = usePaymentsStore((s) => s.records)

  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null)
  const [showEodModal, setShowEodModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const isToday = selectedDate === todayIso()
  const hasPriorDay = days.some((d) => d.date < selectedDate)

  const day = useMemo(
    () => computeDay(selectedDate, days, expenses, paymentRecords),
    [selectedDate, days, expenses, paymentRecords],
  )

  const incomeRows: LedgerRow[] = useMemo(() => paymentRecords
    .filter((r) => r.date === selectedDate)
    .map((r) => ({
      id: r.id, time: r.time ?? '—', description: `${r.studentName} (payment)`, category: 'Income', type: 'income' as const, amount: r.amount,
    })), [paymentRecords, selectedDate])

  const expenseEntriesForDay = useMemo(() => expenses.filter((e) => e.date === selectedDate), [expenses, selectedDate])

  const expenseRows: LedgerRow[] = useMemo(() => expenseEntriesForDay.map((e) => ({
    id: e.id, time: e.time, description: e.description, category: e.category, type: 'expense' as const, amount: e.amount,
  })), [expenseEntriesForDay])

  const rows = useMemo(
    () => [...incomeRows, ...expenseRows].sort((a, b) => a.time.localeCompare(b.time)),
    [incomeRows, expenseRows],
  )

  const totalIncome = incomeRows.reduce((sum, r) => sum + r.amount, 0)
  const totalExpense = expenseRows.reduce((sum, r) => sum + r.amount, 0)
  const closingBalance = day.openingBalance + totalIncome - totalExpense

  const canEdit = !isManager && (day.status === 'flagged' || (day.status === 'open' && isToday))
  const canSubmit = canEdit && rows.length > 0

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const openAddExpense = () => { setEditingExpense(null); setShowExpenseModal(true) }

  const openEditExpense = (id: string) => {
    const entry = expenseEntriesForDay.find((e) => e.id === id)
    if (entry) { setEditingExpense(entry); setShowExpenseModal(true) }
  }

  const handleDelete = (id: string) => {
    deleteExpense(id)
    showToast('Expense deleted')
  }

  const handleExpenseSaved = (entry: ExpenseEntry) => {
    setShowExpenseModal(false)
    showToast(editingExpense ? 'Expense updated' : `Expense recorded — ${entry.id}`)
  }

  const handleSubmitDay = () => {
    submitDay(selectedDate, displayName)
    setShowEodModal(false)
    showToast('End of day submitted to manager')
  }

  const handleApprove = () => {
    approveDay(selectedDate, displayName)
    showToast('Day approved and closed')
  }

  const handleFlag = (note: string) => {
    flagDay(selectedDate, displayName, note)
    showToast('Correction request sent to secretary')
  }

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-0">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Records</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Records</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{formatDateWithWeekday(selectedDate)}</p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={openAddExpense}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            <Plus size={15} /> Record Expense
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <DatePicker value={selectedDate} onChange={setSelectedDate} maxDate={todayIso()} />
        <DayStatusBadge status={day.status} />
        <p className="text-[12.5px] text-gray-500">
          Opening Balance: <span className="font-medium text-gray-800">{formatGHS(day.openingBalance)}</span>
          {' '}
          <span className="text-gray-400">
            ({hasPriorDay ? "carried from previous day's close" : 'starting balance'})
          </span>
        </p>
      </div>

      <RecordsLedgerTable
        rows={rows}
        editable={canEdit}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        onEdit={openEditExpense}
        onDelete={handleDelete}
      />
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

      {isManager && day.status === 'submitted' && (
        <ReviewPanel
          date={selectedDate}
          openingBalance={day.openingBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          closingBalance={closingBalance}
          submittedBy={day.submittedBy}
          submittedAt={day.submittedAt}
          onApprove={handleApprove}
          onFlag={handleFlag}
        />
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[14px] text-gray-800">
          Closing Balance (so far): <span className="font-semibold text-gray-900">{formatGHS(closingBalance)}</span>
        </p>
        {!isManager && (
          <div className="hidden md:block">
            {day.status === 'open' || day.status === 'flagged' ? (
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => setShowEodModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {day.status === 'flagged' ? 'Resubmit End of Day' : 'Submit End of Day'} →
              </button>
            ) : (
              <span className={`px-4 py-2 text-[13px] font-medium rounded-lg ${
                day.status === 'approved' ? 'bg-success-bg text-success' : 'bg-gray-100 text-gray-500'
              }`}>
                {day.status === 'approved' ? 'Approved ✓' : 'Submitted ✓'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile: pinned bottom action bar */}
      {canEdit && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={openAddExpense}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white border border-gray-200 text-gray-800 font-medium text-[13.5px] rounded-xl shadow-modal transition-colors"
          >
            <Plus size={15} /> Expense
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => setShowEodModal(true)}
            className="flex-[1.4] flex items-center justify-center gap-1.5 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[13.5px] rounded-xl shadow-modal transition-colors"
          >
            Submit EOD →
          </button>
        </div>
      )}

      {showExpenseModal && (
        <RecordExpenseModal
          date={selectedDate}
          editing={editingExpense ?? undefined}
          onClose={() => setShowExpenseModal(false)}
          onSaved={handleExpenseSaved}
        />
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
          preparedBy={displayName}
          onClose={() => setShowEodModal(false)}
          onSubmit={handleSubmitDay}
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
