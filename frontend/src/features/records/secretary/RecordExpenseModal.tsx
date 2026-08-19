import { useState } from 'react'
import Dropdown from '../shared/Dropdown'
import DatePicker from '../../../components/ui/DatePicker'
import { todayIso } from '../../payments/utils'
import { EXPENSE_CATEGORIES } from '../shared/types'
import type { ExpenseCategory, ExpenseEntry } from '../shared/types'
import { createExpense, updateExpense } from '../shared/recordsService'
import { apiExpenseToEntry, expenseCategoryValue } from '../shared/recordsMappers'

interface RecordExpenseModalProps {
  date:      string
  editing?:  ExpenseEntry
  onClose:   () => void
  onSaved:   (entry: ExpenseEntry) => void
}

export default function RecordExpenseModal({ date, editing, onClose, onSaved }: RecordExpenseModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>(editing?.category ?? EXPENSE_CATEGORIES[0])
  const [description, setDescription] = useState(editing?.description ?? '')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [entryDate, setEntryDate] = useState(editing?.date ?? date)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim()) { setError('Enter a description'); return }
    const amountNumber = Number(amount)
    if (!amountNumber || amountNumber <= 0) { setError('Enter an amount greater than zero'); return }

    setSubmitting(true)
    setError('')
    try {
      const input = {
        description: description.trim(),
        category: expenseCategoryValue(category),
        amount: amountNumber,
        expenseDate: entryDate,
      }
      const saved = editing
        ? await updateExpense(editing.id, input)
        : await createExpense(input)
      onSaved(apiExpenseToEntry(saved))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The expense could not be saved. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full max-h-[90vh] overflow-y-auto scrollbar-hide p-5">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-4">{editing ? 'Edit Expense' : 'Record Expense'}</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
              Category <span className="text-danger">*</span>
            </label>
            <Dropdown
              value={category}
              onChange={(v) => setCategory(v as ExpenseCategory)}
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <p className="text-[11px] text-gray-400 mt-1">{EXPENSE_CATEGORIES.join(' · ')}</p>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
              Description <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError('') }}
              placeholder="e.g. Fuel for lesson vehicles"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                error && !description.trim() ? 'border-danger focus:ring-danger/20' : 'border-gray-200 focus:ring-brand-600/20 focus:border-brand-600'
              }`}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
              Amount <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError('') }}
              placeholder="GHS 0"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                error ? 'border-danger focus:ring-danger/20' : 'border-gray-200 focus:ring-brand-600/20 focus:border-brand-600'
              }`}
            />
            {error && <p className="text-[12px] text-danger mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
              Date <span className="text-danger">*</span>
            </label>
            <DatePicker value={entryDate} onChange={setEntryDate} maxDate={todayIso()} disabled={!!editing} className="w-full" />
          </div>

        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Record Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
