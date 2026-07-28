import { Check } from 'lucide-react'
import type { Student } from '../shared/types'
import { DEFAULT_LICENCE_PROGRESS, buildLicenceSteps, type LicenceStepStatus } from '../shared/licence'

const ICON_STYLES: Record<LicenceStepStatus, string> = {
  done:   'bg-success text-white',
  active: 'bg-brand-50 text-brand-600',
  locked: 'bg-gray-100 text-gray-400',
}

export default function ManagerLicenceProgressCard({ student }: { student: Student }) {
  const steps = buildLicenceSteps(student.licenceProgress ?? DEFAULT_LICENCE_PROGRESS)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Licence Progress</h2>

      <div className="flex flex-col gap-2.5">
        {steps.map((step) => (
          <div key={step.key} className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ICON_STYLES[step.status]}`}>
              {step.status === 'done' ? <Check size={11} /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
            </div>
            <div className="min-w-0">
              <p className={`text-[13px] font-medium ${step.status === 'locked' ? 'text-gray-400' : 'text-gray-900'}`}>
                {step.label}
              </p>
              {step.detail && <p className="text-[11.5px] text-gray-500">{step.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
