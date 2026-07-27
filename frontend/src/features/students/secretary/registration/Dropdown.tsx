import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  value: string
  onChange: (value: string) => void
  options: DropdownOption[]
  placeholder: string
  disabled?: boolean
}

export default function Dropdown({ value, onChange, options, placeholder, disabled }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-500'}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-card">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-brand-50 transition-colors ${
                    opt.value === value ? 'text-brand-600 font-medium bg-brand-50' : 'text-gray-800'
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
