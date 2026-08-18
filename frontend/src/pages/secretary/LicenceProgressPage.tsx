import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, Lock, ArrowLeft } from 'lucide-react'
import { useApiResource } from '../../lib/useApiResource'
import {
  getStudent,
  updateLicence,
  type ApiStudentProfile,
  type UpdateLicenceInput,
} from '../../features/students/shared/studentService'
import { toLicenceProgress } from '../../features/students/shared/licenceMappers'
import { buildLicenceSteps } from '../../features/students/shared/licence'
import DatePicker from '../../components/ui/DatePicker'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import { ApiError } from '../../lib/apiError'
import { studentProfilePath } from '../../features/students/shared/utils'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function LicenceProgressPage() {
  const { id } = useParams<{ id: string }>()
  const { data: profile, loading, error, refetch } = useApiResource(
    () => getStudent(id as string),
    [id],
  )

  if (loading) return <LoadingState message="Loading licence progress…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!profile) return null

  // Keyed by id so switching students remounts with fresh, prop-seeded progress
  // state — no effect syncing after load.
  return <LicenceEditor key={profile.id} id={id as string} profile={profile} />
}

function LicenceEditor({ id, profile }: { id: string; profile: ApiStudentProfile }) {
  const [progress, setProgress] = useState(() => toLicenceProgress(profile))
  const [eyeTestDate, setEyeTestDate] = useState(today())
  const [learnerDate, setLearnerDate] = useState(today())
  const [examDate, setExamDate] = useState('')
  const [examDateError, setExamDateError] = useState('')
  const [fullLicenceDate, setFullLicenceDate] = useState(today())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const steps = buildLicenceSteps(progress)

  // Persist a step, then re-derive progress from the returned licence row so the
  // pipeline reflects server state (unlocking the next step).
  const save = async (patch: UpdateLicenceInput) => {
    setSaving(true)
    setSaveError(null)
    try {
      const row = await updateLicence(id, patch)
      setProgress(toLicenceProgress(row))
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">Dashboard / Students / {profile.student_name} / Licence</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Licence Progress</h1>
            <p className="text-[12.5px] text-gray-500 mt-0.5">{profile.student_name} — {profile.student_number}</p>
          </div>
          <Link
            to={studentProfilePath(id)}
            className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0"
          >
            <ArrowLeft size={14} /> Back to profile
          </Link>
        </div>
      </div>

      {saveError && (
        <div className="bg-danger-bg border border-danger/20 rounded-2xl p-4">
          <p className="text-[13.5px] text-danger">{saveError}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
        {steps.map((step, i) => {
          const stepNo = i + 1
          return (
            <div key={step.key} className={`p-5 ${step.status === 'locked' ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold ${
                      step.status === 'done'
                        ? 'bg-success text-white'
                        : step.status === 'active'
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.status === 'done' ? <Check size={13} /> : stepNo}
                  </div>
                  <h2 className="text-[13.5px] font-semibold text-gray-900">
                    STEP {stepNo} — {step.label}
                  </h2>
                </div>
                {step.status === 'active' && (
                  <span className="text-[10.5px] font-semibold tracking-wide text-brand-600 bg-brand-50 px-2 py-1 rounded-full shrink-0">
                    ACTIVE STEP
                  </span>
                )}
              </div>

              {step.status === 'done' && (
                <div className="pl-8 flex flex-col gap-1.5">
                  <p className="text-[13px] text-gray-700">{step.detail}</p>
                  <p className="text-[11.5px] text-success flex items-center gap-1">
                    <Check size={12} /> Saved
                  </p>
                </div>
              )}

              {step.status === 'locked' && (
                <div className="pl-8">
                  <p className="text-[12.5px] text-gray-400 flex items-center gap-1.5">
                    <Lock size={12} /> {step.lockedReason}
                  </p>
                </div>
              )}

              {step.status === 'active' && step.key === 'eyeTest' && (
                <div className="pl-8 flex flex-col gap-3">
                  <div className="max-w-xs">
                    <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Date done</label>
                    <DatePicker value={eyeTestDate} onChange={setEyeTestDate} maxDate={today()} className="w-full" />
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => save({ eyeTestDone: true, eyeTestDate })}
                    className="self-start px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}

              {step.status === 'active' && step.key === 'learnerLicence' && (
                <div className="pl-8 flex flex-col gap-3">
                  <div className="max-w-xs">
                    <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Date issued</label>
                    <DatePicker value={learnerDate} onChange={setLearnerDate} maxDate={today()} className="w-full" />
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => save({ learnerLicenceIssued: true, learnerLicenceDate: learnerDate })}
                    className="self-start px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}

              {step.status === 'active' && step.key === 'examDate' && (
                <div className="pl-8 flex flex-col gap-3">
                  <div className="max-w-xs">
                    <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
                      Exam date * (today or future)
                    </label>
                    <DatePicker
                      value={examDate}
                      onChange={(v) => { setExamDate(v); setExamDateError('') }}
                      minDate={today()}
                      className="w-full"
                    />
                    {examDateError && <p className="text-[12px] text-danger mt-1">{examDateError}</p>}
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      if (!examDate) { setExamDateError('Exam date is required'); return }
                      if (examDate < today()) { setExamDateError('Exam date must be today or in the future'); return }
                      save({ examDate })
                    }}
                    className="self-start px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}

              {step.status === 'active' && step.key === 'fullLicence' && (
                <div className="pl-8 flex flex-col gap-3">
                  <div className="max-w-xs">
                    <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Date issued</label>
                    <DatePicker value={fullLicenceDate} onChange={setFullLicenceDate} maxDate={today()} className="w-full" />
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => save({ licenceIssued: true, licenceIssuedDate: fullLicenceDate })}
                    className="self-start px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[12px] text-gray-500">
        Exam venue and the issued licence number aren't stored yet — only dates and stage completion are saved.
      </p>
    </div>
  )
}
