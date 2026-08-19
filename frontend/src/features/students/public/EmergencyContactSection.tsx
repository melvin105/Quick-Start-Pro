import { useEffect } from 'react'
import { Controller } from 'react-hook-form'
import FormField from '../secretary/registration/FormField'
import Dropdown from '../secretary/registration/Dropdown'
import ControlledFormField from '../shared/ControlledFormField'
import { formatPhoneInput, RELATIONSHIP_OPTIONS } from '../shared/registrationFormats'
import type { PublicFormSectionProps } from './formTypes'

export default function EmergencyContactSection({ register, control, errors, watch, setValue }: PublicFormSectionProps) {
  const sameAsNok = watch('sameAsNok')
  const nokName = watch('nokName')
  const nokPhone = watch('nokPhone')
  const nokRelationship = watch('nokRelationship')

  useEffect(() => {
    if (sameAsNok) {
      setValue('ecName', nokName)
      setValue('ecPhone', nokPhone)
      setValue('ecRelationship', nokRelationship)
    }
  }, [sameAsNok, nokName, nokPhone, nokRelationship, setValue])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Emergency Contact</h2>
        <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
          <input type="checkbox" {...register('sameAsNok')} className="accent-brand-600" />
          Same as Next of Kin
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Contact Name" required disabled={sameAsNok} error={errors.ecName?.message} registration={register('ecName')} />
        <ControlledFormField control={control} name="ecPhone" label="Phone" required disabled={sameAsNok} error={errors.ecPhone?.message} inputMode="tel" placeholder="024 123 4567" formatter={formatPhoneInput} />
        <div><label className="block text-[13px] font-medium text-gray-800 mb-1.5">Relationship <span className="text-danger">*</span></label><Controller name="ecRelationship" control={control} render={({ field }) => <Dropdown value={field.value} onChange={field.onChange} disabled={sameAsNok} placeholder="Select relationship" options={RELATIONSHIP_OPTIONS} />} />{errors.ecRelationship && <p className="text-[12px] text-danger mt-1">{errors.ecRelationship.message}</p>}</div>
      </div>
    </div>
  )
}
