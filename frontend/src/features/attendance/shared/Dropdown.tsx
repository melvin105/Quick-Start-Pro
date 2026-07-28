import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
}

export default function Dropdown({ label, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value && o.value !== '')

  return (
    <div className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full sm:w-auto flex items-center justify-between gap-2 px-3 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        {selected ? selected.label : label}
        <ChevronDown size={14} className={`text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute left-0 z-20 mt-1 min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-card overflow-hidden max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <li key={opt.value || 'all'}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-[13px] whitespace-nowrap hover:bg-brand-50 transition-colors ${
                    opt.value === value ? 'text-brand-600 font-medium bg-brand-50' : 'text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
