import { useState } from 'react'
import { Check, Flag } from 'lucide-react'
import { formatGHS } from '../../payments/utils'
import { formatDateWithWeekday, formatTimeAmPm } from '../shared/utils'

interface ReviewPanelProps {
  date:           string
  openingBalance: number
  totalIncome:    number
  totalExpense:   number
  closingBalance: number
  submittedBy?:   string
  submittedAt?:   string
  onApprove:      () => void
  onFlag:         (note: string) => void
}

export default function ReviewPanel({
  date, openingBalance, totalIncome, totalExpense, closingBalance, submittedBy, submittedAt, onApprove, onFlag,
}: ReviewPanelProps) {
  const [flagging, setFlagging] = useState(false)
  const [note, setNote] = useState('')

  const preparedTime = submittedAt ? formatTimeAmPm(new Date(submittedAt).toTimeString().slice(0, 5)) : undefined

  const handleSendFlag = () => {
    if (!note.trim()) return
    onFlag(note.trim())
    setFlagging(false)
    setNote('')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      <p className="text-[13.5px] text-gray-800 mb-3">
        <span className="font-medium">{submittedBy ?? 'Secretary'}</span> has submitted the end-of-day summary for {formatDateWithWeekday(date)}.
      </p>

      <div className="flex flex-col gap-1.5 text-[13px] border-t border-gray-100 pt-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Opening Balance</span>
          <span className="font-medium text-gray-900">{formatGHS(openingBalance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Income</span>
          <span className="font-medium text-success">{formatGHS(totalIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total Expenses</span>
          <span className="font-medium text-danger">{formatGHS(totalExpense)}</span>
        </div>
        <div className="flex justify-between text-[14.5px] font-semibold pt-1.5 mt-1 border-t border-gray-100">
          <span className="text-gray-900">Closing Balance</span>
          <span className="text-gray-900">{formatGHS(closingBalance)}</span>
        </div>
      </div>

      {preparedTime && (
        <p className="text-[11.5px] text-gray-400 mt-3">Prepared by: {submittedBy} · Time: {preparedTime}</p>
      )}

      {flagging ? (
        <div className="mt-4 flex flex-col gap-2">
          <label className="text-[13px] font-medium text-gray-800">What needs correcting?</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. Fuel expense amount looks off"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setFlagging(false); setNote('') }}
              className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!note.trim()}
              onClick={handleSendFlag}
              className="px-4 py-2 text-[13px] font-medium text-white bg-warning hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Send Flag
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={() => setFlagging(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Flag size={14} /> Flag Issue
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-success hover:opacity-90 rounded-lg transition-colors"
          >
            <Check size={14} /> Approve & Close
          </button>
        </div>
      )}
    </div>
  )
}
