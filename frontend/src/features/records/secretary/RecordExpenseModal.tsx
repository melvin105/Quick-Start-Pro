import { useState } from 'react'
import useRecordsStore from '../shared/store'
import { EXPENSE_CATEGORIES } from '../shared/types'
import type { ExpenseCategory, ExpenseEntry } from '../shared/types'

interface RecordExpenseModalProps {
  date:      string
  editing?:  ExpenseEntry
  onClose:   () => void
  onSaved:   (entry: ExpenseEntry) => void
}

export default function RecordExpenseModal({ date, editing, onClose, onSaved }: RecordExpenseModalProps) {
  const addExpense = useRecordsStore((s) => s.addExpense)
  const updateExpense = useRecordsStore((s) => s.updateExpense)

  const [category, setCategory] = useState<ExpenseCategory>(editing?.category ?? EXPENSE_CATEGORIES[0])
  const [description, setDescription] = useState(editing?.description ?? '')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [entryDate, setEntryDate] = useState(editing?.date ?? date)
  const [notes, setNotes] = useState(editing?.notes ?? '')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!description.trim()) { setError('Enter a description'); return }
    const amountNumber = Number(amount)
    if (!amountNumber || amountNumber <= 0) { setError('Enter an amount greater than zero'); return }

    if (editing) {
      const patch = { description: description.trim(), category, amount: amountNumber, notes: notes || undefined }
      updateExpense(editing.id, patch)
      onSaved({ ...editing, ...patch })
    } else {
      const entry = addExpense({ date: entryDate, description: description.trim(), category, amount: amountNumber, notes: notes || undefined })
      onSaved(entry)
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
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
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
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              disabled={!!editing}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
            />
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
            onClick={handleSubmit}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            {editing ? 'Save Changes' : 'Record Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}
