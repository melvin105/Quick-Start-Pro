import { Check, Lock } from 'lucide-react'
import type { Student } from '../shared/types'
import { DEFAULT_LICENCE_PROGRESS, buildLicenceSteps } from '../shared/licence'

export default function StudentLicenceTabContent({ student }: { student: Student }) {
  if (student.enrolment === 'Driving Only') {
    return (
      <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
        Not applicable — Driving Only enrolment.
      </div>
    )
  }

  const steps = buildLicenceSteps(student.licenceProgress ?? DEFAULT_LICENCE_PROGRESS)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
      {steps.map((step, i) => (
        <div key={step.key} className={`p-5 ${step.status === 'locked' ? 'opacity-60' : ''}`}>
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
              {step.status === 'done' ? <Check size={13} /> : i + 1}
            </div>
            <h2 className="text-[13.5px] font-semibold text-gray-900">STEP {i + 1} — {step.label}</h2>
          </div>

          <div className="pl-8 mt-2">
            {step.status === 'done' && step.detail && (
              <p className="text-[13px] text-gray-700">{step.detail}</p>
            )}
            {step.status === 'active' && (
              <p className="text-[13px] text-gray-500">In progress{step.detail ? ` — ${step.detail}` : ''}</p>
            )}
            {step.status === 'locked' && (
              <p className="text-[12.5px] text-gray-400 flex items-center gap-1.5">
                <Lock size={12} /> {step.lockedReason}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
