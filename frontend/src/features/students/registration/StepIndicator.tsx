import { Check } from 'lucide-react'

interface StepIndicatorProps {
  phase: 'details' | 'review'
}

const STEPS = [
  { key: 'details', label: 'Details' },
  { key: 'review',  label: 'Review' },
] as const

export default function StepIndicator({ phase }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((step, i) => {
        const isActive = step.key === phase
        const isDone = phase === 'review' && step.key === 'details'
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold shrink-0 ${
                isDone ? 'bg-success text-white' : isActive ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {isDone ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-[13px] font-medium ${isActive || isDone ? 'text-gray-900' : 'text-gray-400'}`}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300 mx-1" />}
          </div>
        )
      })}
    </div>
  )
}
