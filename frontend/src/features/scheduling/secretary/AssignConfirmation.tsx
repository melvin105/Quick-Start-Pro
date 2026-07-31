import type { SlotRef } from '../shared/utils'
import { formatSlotLabel } from '../shared/utils'

interface AssignConfirmationProps {
  studentName: string
  targetLabel: string
  sourceLabel?: string
  mode?: 'assign' | 'move'
  existingSlots: SlotRef[]
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function AssignConfirmation({
  studentName, targetLabel, sourceLabel, mode = 'assign', existingSlots, confirmLabel = 'Assign', onConfirm, onCancel,
}: AssignConfirmationProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13.5px] text-gray-800">
        {mode === 'move' ? (
          <>
            Move <span className="font-semibold text-gray-900">{studentName}</span> from{' '}
            <span className="font-semibold text-gray-900">{sourceLabel}</span> to{' '}
            <span className="font-semibold text-gray-900">{targetLabel}</span>?
          </>
        ) : (
          <>
            Assign <span className="font-semibold text-gray-900">{studentName}</span> to{' '}
            <span className="font-semibold text-gray-900">{targetLabel}</span>?
          </>
        )}
      </p>

      {existingSlots.length > 0 && (
        <div className="bg-warning-bg rounded-lg p-3 flex flex-col gap-1.5">
          <p className="text-[12px] font-medium text-warning">This student is already assigned to:</p>
          <ul className="flex flex-col gap-0.5">
            {existingSlots.map((s) => (
              <li key={`${s.day}-${s.hour}`} className="text-[12.5px] text-gray-700">
                {formatSlotLabel(s.day, s.hour, true)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  )
}
