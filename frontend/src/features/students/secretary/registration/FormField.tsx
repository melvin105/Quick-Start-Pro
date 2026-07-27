import type { UseFormRegisterReturn } from 'react-hook-form'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  registration: UseFormRegisterReturn
}

export default function FormField({ label, required, error, type = 'text', placeholder, disabled, registration }: FormFieldProps) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...registration}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 transition-colors disabled:opacity-60 disabled:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-brand-600/20
          ${error ? 'border-danger focus:border-danger' : 'border-gray-200 focus:border-brand-600'}`}
      />
      {error && <p className="text-[12px] text-danger mt-1">{error}</p>}
    </div>
  )
}
