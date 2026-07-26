import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Check, Lock, ArrowLeft } from 'lucide-react'
import useStudentsStore from '../features/students/store'
import { DEFAULT_LICENCE_PROGRESS, buildLicenceSteps } from '../features/students/licence'
import type { LicenceProgress } from '../features/students/types'
import { ROUTES } from '../lib/constants'
import { studentProfilePath } from '../features/students/utils'

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function LicenceProgressPage() {
  const { id } = useParams<{ id: string }>()
  const student = useStudentsStore((s) => s.students.find((st) => st.id === id))
  const updateStudent = useStudentsStore((s) => s.updateStudent)

  const [eyeTestDate, setEyeTestDate] = useState(today())
  const [learnerDate, setLearnerDate] = useState(today())
  const [learnerNo, setLearnerNo] = useState('')
  const [examDate, setExamDate] = useState('')
  const [examVenue, setExamVenue] = useState('')
  const [examDateError, setExamDateError] = useState('')
  const [examResult, setExamResult] = useState<'passed' | 'failed' | ''>('')
  const [examResultDate, setExamResultDate] = useState(today())
  const [fullLicenceNo, setFullLicenceNo] = useState('')
  const [fullLicenceDate, setFullLicenceDate] = useState(today())

  if (!student) {
    return <Navigate to={ROUTES.STUDENTS} replace />
  }

  const progress = student.licenceProgress ?? DEFAULT_LICENCE_PROGRESS
  const steps = buildLicenceSteps(progress)

  const save = (patch: Partial<LicenceProgress>) => {
    updateStudent(student.id, { licenceProgress: { ...progress, ...patch } })
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">Dashboard / Students / {student.name} / Licence</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Licence Progress</h1>
            <p className="text-[12.5px] text-gray-500 mt-0.5">{student.name} — {student.id}</p>
          </div>
          <Link
            to={studentProfilePath(student.id)}
            className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0"
          >
            <ArrowLeft size={14} /> Back to profile
          </Link>
        </div>
      </div>

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
                    <input
                      type="date"
                      value={eyeTestDate}
                      onChange={(e) => setEyeTestDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => save({ eyeTest: { done: true, dateDone: eyeTestDate } })}
                    className="self-start px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}

              {step.status === 'active' && step.key === 'learnerLicence' && (
                <div className="pl-8 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Date issued</label>
                      <input
                        type="date"
                        value={learnerDate}
                        onChange={(e) => setLearnerDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Licence No.</label>
                      <input
                        type="text"
                        value={learnerNo}
                        onChange={(e) => setLearnerNo(e.target.value)}
                        placeholder="e.g. GHA-LEARN-00234"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!learnerNo.trim()}
                    onClick={() => save({ learnerLicence: { issued: true, dateIssued: learnerDate, licenceNo: learnerNo } })}
                    className="self-start px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}

              {step.status === 'active' && step.key === 'examDate' && (
                <div className="pl-8 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
                        Exam date * (today or future)
                      </label>
                      <input
                        type="date"
                        min={today()}
                        value={examDate}
                        onChange={(e) => { setExamDate(e.target.value); setExamDateError('') }}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                          examDateError
                            ? 'border-danger focus:ring-danger/20'
                            : 'border-gray-200 focus:ring-brand-600/20 focus:border-brand-600'
                        }`}
                      />
                      {examDateError && <p className="text-[12px] text-danger mt-1">{examDateError}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Venue</label>
                      <input
                        type="text"
                        value={examVenue}
                        onChange={(e) => setExamVenue(e.target.value)}
                        placeholder="e.g. DVLA Kumasi"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!examDate) { setExamDateError('Exam date is required'); return }
                      if (examDate < today()) { setExamDateError('Exam date must be today or in the future'); return }
                      save({ examDate: { date: examDate, venue: examVenue || undefined } })
                    }}
                    className="self-start px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}

              {step.status === 'active' && step.key === 'examResult' && (
                <div className="pl-8 flex flex-col gap-3">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Result</label>
                    <div className="flex gap-2">
                      {(['passed', 'failed'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setExamResult(r)}
                          className={`px-4 py-2 rounded-lg text-[13px] font-medium border-2 transition-colors ${
                            examResult === r
                              ? r === 'passed'
                                ? 'border-success bg-success-bg text-success'
                                : 'border-danger bg-danger-bg text-danger'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {r === 'passed' ? 'Passed' : 'Failed'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="max-w-xs">
                    <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={examResultDate}
                      onChange={(e) => setExamResultDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!examResult}
                    onClick={() => save({ examResult: { passed: examResult === 'passed', date: examResultDate } })}
                    className="self-start px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}

              {step.status === 'active' && step.key === 'fullLicence' && (
                <div className="pl-8 flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Date issued</label>
                      <input
                        type="date"
                        value={fullLicenceDate}
                        onChange={(e) => setFullLicenceDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Licence No.</label>
                      <input
                        type="text"
                        value={fullLicenceNo}
                        onChange={(e) => setFullLicenceNo(e.target.value)}
                        placeholder="e.g. GHA-FULL-00234"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!fullLicenceNo.trim()}
                    onClick={() => save({ fullLicence: { issued: true, dateIssued: fullLicenceDate, licenceNo: fullLicenceNo } })}
                    className="self-start px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
