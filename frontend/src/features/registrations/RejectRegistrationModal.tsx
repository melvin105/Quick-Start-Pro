import { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { rejectRegistration } from './registrationService'
import type { PendingItem } from './registrationMappers'
import { ApiError } from '../../lib/apiError'

interface RejectRegistrationModalProps {
  registration: PendingItem
  onClose:      () => void
  onRejected:   () => void
}

export default function RejectRegistrationModal({
  registration,
  onClose,
  onRejected,
}: RejectRegistrationModalProps) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = reason.trim() !== '' && !submitting

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      await rejectRegistration(registration.id, reason.trim())
      onRejected()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reject this registration.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">Reject Registration</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="text-[13px] text-gray-600">
          Rejecting <span className="font-medium text-gray-900">{registration.name}</span>'s submission. This is recorded and can't be undone here.
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            rows={3}
            placeholder="e.g. Duplicate submission, or incomplete details"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 disabled:opacity-60"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2 text-[12.5px] text-danger">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-danger hover:bg-danger/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}
