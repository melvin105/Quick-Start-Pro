import { useState } from 'react'
import { Check, Flag } from 'lucide-react'
import { formatDateWithWeekday, formatTimeAmPm } from '../shared/utils'
import { formatGHS } from '../../payments/utils'
import type { DayRecord, LedgerRow } from '../shared/types'

interface ReviewDayViewProps {
  date:           string
  day:            DayRecord
  incomeRows:     LedgerRow[]
  expenseRows:    LedgerRow[]
  totalIncome:    number
  totalExpense:   number
  closingBalance: number
  onApprove:      () => void
  onRequestCorrection: (note: string) => void
}

function firstName(name?: string) {
  return name?.split(' ')[0] ?? 'the secretary'
}

export default function ReviewDayView({
  date, day, incomeRows, expenseRows, totalIncome, totalExpense, closingBalance, onApprove, onRequestCorrection,
}: ReviewDayViewProps) {
  const [note, setNote] = useState('')

  const submittedTime = day.submittedAt
    ? formatTimeAmPm(new Date(day.submittedAt).toTimeString().slice(0, 5))
    : undefined

  const title = day.status === 'approved'
    ? 'Daily Records — Closed'
    : day.status === 'flagged'
      ? 'Daily Records — Flagged'
      : 'End of Day — Review & Approve'

  const handleRequestCorrection = () => {
    onRequestCorrection(note.trim() || 'Please review and resubmit.')
    setNote('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
          <p className="text-[12.5px] text-gray-500">{formatDateWithWeekday(date)}</p>
          {day.submittedBy && (
            <p className="text-[12px] text-gray-500 mt-1">
              Submitted by {day.submittedBy}{submittedTime ? ` at ${submittedTime}` : ''}
            </p>
          )}
        </div>
        {day.status === 'approved' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-success-bg text-success whitespace-nowrap">
            <Check size={12} /> Closed
          </span>
        )}
        {day.status === 'flagged' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-warning-bg text-warning whitespace-nowrap">
            <Flag size={12} /> Flagged
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex justify-between text-[13px] pb-3 border-b border-gray-100">
          <span className="text-gray-500">Opening Balance</span>
          <span className="font-medium text-gray-900">{formatGHS(day.openingBalance)}</span>
        </div>

        <div className="pb-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Income</p>
          <div className="flex flex-col gap-1.5">
            {incomeRows.map((r) => (
              <div key={r.id} className="flex justify-between text-[13px]">
                <span className="text-gray-700 truncate pr-2">{r.description}</span>
                <span className="text-gray-900 shrink-0">{formatGHS(r.amount)}</span>
              </div>
            ))}
            {incomeRows.length === 0 && <p className="text-[12px] text-gray-400">No income recorded</p>}
          </div>
          <div className="flex justify-between text-[13.5px] font-semibold mt-2.5">
            <span className="text-success">Total Income</span>
            <span className="text-success">{formatGHS(totalIncome)}</span>
          </div>
        </div>

        <div className="pb-4 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Expenses</p>
          <div className="flex flex-col gap-1.5">
            {expenseRows.map((r) => (
              <div key={r.id} className="flex justify-between text-[13px]">
                <span className="text-gray-700 truncate pr-2">{r.description}</span>
                <span className="text-gray-900 shrink-0">{formatGHS(r.amount)}</span>
              </div>
            ))}
            {expenseRows.length === 0 && <p className="text-[12px] text-gray-400">No expenses recorded</p>}
          </div>
          <div className="flex justify-between text-[13.5px] font-semibold mt-2.5">
            <span className="text-danger">Total Expenses</span>
            <span className="text-danger">{formatGHS(totalExpense)}</span>
          </div>
        </div>

        <div className="flex justify-between text-[14.5px] font-semibold">
          <span className="text-gray-900">Closing Balance</span>
          <span className="text-gray-900">{formatGHS(closingBalance)}</span>
        </div>

        {day.status === 'flagged' && day.flagNote && (
          <div className="bg-warning-bg border border-warning/30 rounded-2xl p-4 flex items-start gap-2.5">
            <Flag size={15} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-warning">Your note to {firstName(day.submittedBy)}</p>
              <p className="text-[13px] text-gray-700 mt-0.5">{day.flagNote}</p>
            </div>
          </div>
        )}

        {day.status === 'submitted' && (
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-[13px] font-medium text-gray-800">Request a correction:</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={`Optional note to ${firstName(day.submittedBy)}`}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
            />
            <div className="flex flex-col sm:flex-row gap-2 mt-1">
              <button
                type="button"
                onClick={handleRequestCorrection}
                className="flex-1 px-4 py-2.5 text-[13.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Request Correction
              </button>
              <button
                type="button"
                onClick={onApprove}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13.5px] font-medium text-white bg-success hover:opacity-90 rounded-lg transition-colors"
              >
                <Check size={15} /> Approve &amp; Close Day
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
