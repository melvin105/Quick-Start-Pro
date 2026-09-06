import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

interface Props<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  required?: boolean
  error?: string
  placeholder?: string
  disabled?: boolean
  inputMode?: 'text' | 'numeric' | 'tel'
  autoComplete?: string
  formatter: (value: string) => string
}

export default function ControlledFormField<T extends FieldValues>({
  control, name, label, required, error, placeholder, disabled, inputMode = 'text', autoComplete, formatter,
}: Props<T>) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
        {label}{required && <span className="text-danger"> *</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            ref={field.ref}
            name={field.name}
            value={String(field.value ?? '')}
            onBlur={field.onBlur}
            onChange={(event) => field.onChange(formatter(event.target.value))}
            disabled={disabled}
            inputMode={inputMode}
            autoComplete={autoComplete ?? (inputMode === 'tel' ? 'tel' : undefined)}
            placeholder={placeholder}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder:text-gray-500 transition-colors disabled:opacity-60 disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-600/20 ${error ? 'border-danger focus:border-danger' : 'border-gray-200 focus:border-brand-600'}`}
          />
        )}
      />
      {error && <p className="text-[12px] text-danger mt-1">{error}</p>}
    </div>
  )
}
