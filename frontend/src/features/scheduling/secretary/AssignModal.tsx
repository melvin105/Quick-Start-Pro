import AssignForm from './AssignForm'
import { formatSlotLabel } from '../shared/utils'
import type { Day } from '../shared/types'

interface AssignModalProps {
  day: Day
  hour: number
  excludeIds: string[]
  onAssign: (studentId: string) => void
  onClose: () => void
}

export default function AssignModal({ day, hour, excludeIds, onAssign, onClose }: AssignModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full max-h-[90vh] overflow-y-auto p-5">
        <p className="text-[14.5px] font-semibold text-gray-900 mb-3">{formatSlotLabel(day, hour, true)}</p>
        <AssignForm day={day} hour={hour} excludeIds={excludeIds} onAssign={onAssign} onCancel={onClose} />
      </div>
    </div>
  )
}
