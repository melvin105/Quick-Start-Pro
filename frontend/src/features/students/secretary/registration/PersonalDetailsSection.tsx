import { Controller } from 'react-hook-form'
import FormField from './FormField'
import Dropdown from './Dropdown'
import PassportPhotoUpload from './PassportPhotoUpload'
import DatePicker from '../../../../components/ui/DatePicker'
import type { FormSectionProps } from './formTypes'
import ControlledFormField from '../../shared/ControlledFormField'
import { formatIdNumber, formatPhoneInput, ID_CARD_TYPES, idNumberPlaceholder } from '../../shared/registrationFormats'

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function PersonalDetailsSection({ register, control, errors, watch, setValue }: FormSectionProps) {
  const cardType = watch('idCardType') ?? ''
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Personal Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="passportPhoto"
          control={control}
          render={({ field }) => <PassportPhotoUpload value={field.value} onChange={field.onChange} />}
        />

        <FormField label="First Name" required error={errors.firstName?.message} registration={register('firstName')} />
        <FormField label="Last Name" required error={errors.lastName?.message} registration={register('lastName')} />
        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
            Date of Birth <span className="text-danger">*</span>
          </label>
          <Controller
            name="dob"
            control={control}
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} maxDate={todayIso()} className="w-full" />
            )}
          />
          {errors.dob && <p className="text-[12px] text-danger mt-1">{errors.dob.message}</p>}
        </div>

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

        <ControlledFormField control={control} name="phone" label="Phone Number" required error={errors.phone?.message} inputMode="tel" placeholder="024 123 4567" formatter={formatPhoneInput} />
        <FormField label="Email" type="email" error={errors.email?.message} registration={register('email')} />
        <FormField label="Residential Address" error={errors.address?.message} registration={register('address')} />

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
            Card Type
          </label>
          <Controller
            name="idCardType"
            control={control}
            render={({ field }) => (
              <Dropdown
                value={field.value ?? ''}
                onChange={(value) => { field.onChange(value); setValue('idCardNumber', '') }}
                placeholder="Select ID type"
                options={ID_CARD_TYPES.map((t) => ({ value: t, label: t }))}
              />
            )}
          />
          {errors.idCardType && <p className="text-[12px] text-danger mt-1">{errors.idCardType.message}</p>}
        </div>
        <ControlledFormField control={control} name="idCardNumber" label="Identity Number" error={errors.idCardNumber?.message} inputMode={cardType === 'Ghana Card' || cardType === 'Voter ID' ? 'numeric' : 'text'} placeholder={idNumberPlaceholder(cardType)} formatter={(value) => formatIdNumber(cardType, value)} />
      </div>
    </div>
  )
}
