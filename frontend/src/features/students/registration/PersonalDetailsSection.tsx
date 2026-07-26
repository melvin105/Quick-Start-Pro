import { Controller } from 'react-hook-form'
import FormField from './FormField'
import type { FormSectionProps } from './formTypes'

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const

export default function PersonalDetailsSection({ register, control, errors }: FormSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Personal Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="First Name" required error={errors.firstName?.message} registration={register('firstName')} />
        <FormField label="Last Name" required error={errors.lastName?.message} registration={register('lastName')} />
        <FormField label="Date of Birth" required type="date" error={errors.dob?.message} registration={register('dob')} />

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
            Gender <span className="text-danger">*</span>
          </label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-4 h-[42px]">
                {GENDERS.map((g) => (
                  <label key={g.value} className="flex items-center gap-1.5 text-[13.5px] text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      checked={field.value === g.value}
                      onChange={() => field.onChange(g.value)}
                      className="accent-brand-600"
                    />
                    {g.label}
                  </label>
                ))}
              </div>
            )}
          />
          {errors.gender && <p className="text-[12px] text-danger mt-1">{errors.gender.message}</p>}
        </div>

        <FormField label="Phone Number" required error={errors.phone?.message} registration={register('phone')} />
        <FormField label="Email" type="email" error={errors.email?.message} registration={register('email')} />
        <FormField label="Residential Address" error={errors.address?.message} registration={register('address')} />
        <FormField label="Ghana Card Number" error={errors.ghanaCardNumber?.message} registration={register('ghanaCardNumber')} />
      </div>
    </div>
  )
}
