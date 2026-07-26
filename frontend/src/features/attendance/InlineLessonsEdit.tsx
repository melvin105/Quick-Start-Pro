import { useState } from 'react'
import { Check } from 'lucide-react'

interface InlineLessonsEditProps {
  initialValue: number
  onSave: (value: number) => void
}

export default function InlineLessonsEdit({ initialValue, onSave }: InlineLessonsEditProps) {
  const [value, setValue] = useState(initialValue)
  const [saved, setSaved] = useState(true)

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <span className="text-[11px] text-gray-500">Lessons Left:</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => { setValue(Number(e.target.value)); setSaved(false) }}
        className="w-12 px-1.5 py-0.5 border border-gray-200 rounded text-[12px] text-center focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
      />
      <button
        type="button"
        onClick={() => { onSave(value); setSaved(true) }}
        disabled={saved}
        className="flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-700 disabled:opacity-40 disabled:cursor-default"
      >
        <Check size={12} /> Save
      </button>
    </div>
  )
}
