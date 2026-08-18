import { useState } from 'react'
import { X, AlertTriangle, Loader2, CheckCircle2, UserRound } from 'lucide-react'
import { approveRegistration } from './registrationService'
import type { PendingItem } from './registrationMappers'
import { ApiError } from '../../lib/apiError'
import type { ApiEnrolmentType } from '../students/shared/studentService'
import { enrolmentLabel } from '../students/shared/studentMappers'
import Dropdown from '../students/secretary/registration/Dropdown'

interface CompleteRegistrationModalProps {
  registration: PendingItem
  onClose:      () => void
  onCompleted:  () => void
}

// The three enrolment types the desk chooses, in the register wizard's order.
// Package and fees are set on the student's profile after completion (same as
// before), so enrolment is the only pick made here.
const ENROLMENT_TYPES: ApiEnrolmentType[] = ['driving_and_licence', 'driving_only', 'licence_only']

// One read-only field in the review. Renders nothing when the student left it
// blank, so optional fields don't leave empty rows.
function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-[13px] text-gray-900">{value}</p>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
    </div>
  )
}

export default function CompleteRegistrationModal({
  registration,
  onClose,
  onCompleted,
}: CompleteRegistrationModalProps) {
  const { details } = registration

  const [enrolmentType, setEnrolmentType] = useState<ApiEnrolmentType>('driving_and_licence')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Set when the backend flags a possible duplicate (409). Completing again with
  // this true tells the server the staff confirmed it's a genuinely new person.
  const [duplicate, setDuplicate] = useState(false)
  // Set once the student record is created — flips the modal to the success view.
  const [studentNumber, setStudentNumber] = useState<string | null>(null)

  const submit = async (confirmDifferentPerson: boolean) => {
    setSubmitting(true)
    setError(null)
    try {
      const student = await approveRegistration(registration.id, {
        enrolmentType,
        confirmDifferentPerson,
      })
      setStudentNumber(student.student_number)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.code === 'POSSIBLE_DUPLICATE') {
        setDuplicate(true)
        setError(err.message)
      } else if (err instanceof ApiError && err.status === 409 && err.code === 'ALREADY_REVIEWED') {
        // Already handled (double-click, or completed in another session). The
        // student record already exists — close and refresh the queue rather
        // than showing a red error for a benign terminal state.
        onCompleted()
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not complete this registration.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Success view — shown once the student record is created. */}
        {studentNumber ? (
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-success-bg text-success flex items-center justify-center">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-gray-900">Registration completed</h2>
              <p className="text-[13px] text-gray-600 mt-1">
                {registration.name} is now enrolled as{' '}
                <span className="font-semibold text-gray-900">{studentNumber}</span> and appears under Active students.
              </p>
            </div>
            <button
              type="button"
              onClick={onCompleted}
              className="w-full mt-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">Complete Registration</h2>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  Review {registration.name}'s details, then set the enrolment.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1 min-h-0 flex flex-col gap-3">
              {/* Photo + name banner */}
              <div className="flex items-center gap-3">
                {details.photoUrl ? (
                  <img src={details.photoUrl} alt="" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <UserRound size={24} />
                  </div>
                )}
                <div>
                  <p className="text-[15px] font-semibold text-gray-900">{registration.name}</p>
                  <p className="text-[12px] text-gray-500">Submitted {registration.submittedLabel}</p>
                </div>
              </div>

              <ReviewSection title="Personal Details">
                <Field label="Date of Birth" value={details.dobLabel} />
                <Field label="Gender" value={details.genderLabel} />
                <Field label="Phone" value={registration.phone} />
                <Field label="Email" value={details.email} />
                <Field label="Address" value={details.address} />
                <Field label={details.idCardType || 'ID Card'} value={details.idCardNumber} />
              </ReviewSection>

              <ReviewSection title="Next of Kin">
                <Field label="Name" value={details.nextOfKin.name} />
                <Field label="Relationship" value={details.nextOfKin.relationship} />
                <Field label="Phone" value={details.nextOfKin.phone} />
                <Field label="Email" value={details.nextOfKin.email} />
              </ReviewSection>

              <ReviewSection title="Emergency Contact">
                <Field label="Name" value={details.emergency.name} />
                <Field label="Relationship" value={details.emergency.relationship} />
                <Field label="Phone" value={details.emergency.phone} />
              </ReviewSection>

              {/* Enrolment — the desk decision. Scrolls together with the review
                  above (one body, no static panel). Its menu opens upward
                  (menuPlacement) so it isn't clipped at the scroll edge. Package
                  and fees are set on the student's profile after, as before. */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Enrolment</h3>
                <label className="block text-[12px] font-medium text-gray-800 mb-1.5">
                  Enrolment Type <span className="text-danger">*</span>
                </label>
                <Dropdown
                  value={enrolmentType}
                  onChange={(value) => setEnrolmentType(value as ApiEnrolmentType)}
                  placeholder="Select enrolment"
                  disabled={submitting}
                  menuPlacement="up"
                  options={ENROLMENT_TYPES.map((t) => ({ value: t, label: enrolmentLabel(t) }))}
                />
                <p className="mt-1.5 text-[11.5px] text-gray-500">
                  The package and fees are set on the student's profile after completion.
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
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-200">
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
                {duplicate ? 'Complete anyway' : 'Complete'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
