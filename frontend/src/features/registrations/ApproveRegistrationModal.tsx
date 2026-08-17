import { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { approveRegistration } from './registrationService'
import type { PendingItem } from './registrationMappers'
import { ApiError } from '../../lib/apiError'
import type { ApiEnrolmentType } from '../students/shared/studentService'
import { enrolmentLabel } from '../students/shared/studentMappers'

interface ApproveRegistrationModalProps {
  registration: PendingItem
  onClose:      () => void
  onApproved:   () => void
}

// The three enrolment types the desk chooses at approval, in the display order
// the register wizard uses. Package/fee assignment is deferred (see
// registrationService.ApproveRegistrationInput), so enrolment is the only pick.
const ENROLMENT_TYPES: ApiEnrolmentType[] = ['driving_and_licence', 'driving_only', 'licence_only']

export default function ApproveRegistrationModal({
  registration,
  onClose,
  onApproved,
}: ApproveRegistrationModalProps) {
  const [enrolmentType, setEnrolmentType] = useState<ApiEnrolmentType>('driving_and_licence')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Set when the backend flags a possible duplicate (409). Approving again with
  // this true tells the server the staff confirmed it's a genuinely new person.
  const [duplicate, setDuplicate] = useState(false)

  const submit = async (confirmDifferentPerson: boolean) => {
    setSubmitting(true)
    setError(null)
    try {
      await approveRegistration(registration.id, { enrolmentType, confirmDifferentPerson })
      onApproved()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.code === 'POSSIBLE_DUPLICATE') {
        setDuplicate(true)
        setError(err.message)
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not approve this registration.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">Approve Registration</h2>
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
          Creating a student record for <span className="font-medium text-gray-900">{registration.name}</span>
          {registration.phone && <> · {registration.phone}</>}.
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Enrolment</label>
          <select
            value={enrolmentType}
            onChange={(e) => setEnrolmentType(e.target.value as ApiEnrolmentType)}
            disabled={submitting}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 disabled:opacity-60"
          >
            {ENROLMENT_TYPES.map((type) => (
              <option key={type} value={type}>{enrolmentLabel(type)}</option>
            ))}
          </select>
          <p className="mt-1.5 text-[11.5px] text-gray-500">
            The package and fees are set on the student's profile after approval.
          </p>
        </div>

        {error && (
          <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-[12.5px] ${
            duplicate ? 'bg-warning-bg text-warning' : 'bg-danger-bg text-danger'
          }`}>
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
            disabled={submitting}
            onClick={() => submit(duplicate)}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {duplicate ? 'Approve anyway' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}
