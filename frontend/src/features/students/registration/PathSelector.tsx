interface PathSelectorProps {
  value: 'self' | 'qr'
  onChange: (value: 'self' | 'qr') => void
}

const OPTIONS = [
  { key: 'self', label: 'Fill myself', hint: 'Complete every step yourself in the app.' },
  { key: 'qr',   label: 'Send to student via QR', hint: "Generate a QR code for the student's phone." },
] as const

export default function PathSelector({ value, onChange }: PathSelectorProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <p className="text-[13px] font-medium text-gray-800 mb-3">How would you like to fill this in?</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            className={`flex-1 text-left px-4 py-3 rounded-xl border-2 transition-colors ${
              value === opt.key ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className={`text-[13.5px] font-medium ${value === opt.key ? 'text-brand-600' : 'text-gray-800'}`}>{opt.label}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{opt.hint}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
