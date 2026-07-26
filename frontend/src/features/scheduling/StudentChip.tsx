import { AlertTriangle } from 'lucide-react'
import type { SlotAssignment } from './types'
import { lessonTone } from './utils'

const TONE_CLASSES: Record<string, string> = {
  green: 'border-l-success bg-success-bg/60',
  amber: 'border-l-warning bg-warning-bg',
  grey:  'border-l-gray-300 bg-gray-100',
}

interface StudentChipProps {
  name: string
  assignment: SlotAssignment
}

export default function StudentChip({ name, assignment }: StudentChipProps) {
  const tone = lessonTone(assignment.lessonsRemaining)
  return (
    <div className={`border-l-2 rounded-r-md px-1.5 py-1 text-left w-full ${TONE_CLASSES[tone]}`}>
      <p className="text-[11px] font-medium text-gray-900 truncate flex items-center gap-1">
        {tone === 'amber' && <AlertTriangle size={10} className="text-warning shrink-0" />}
        <span className="truncate">{name}</span>
      </p>
    </div>
  )
}
