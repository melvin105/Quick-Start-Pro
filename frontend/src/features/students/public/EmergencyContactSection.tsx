import { useEffect } from 'react'
import FormField from '../secretary/registration/FormField'
import type { PublicFormSectionProps } from './formTypes'

export default function EmergencyContactSection({ register, errors, watch, setValue }: PublicFormSectionProps) {
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
        <FormField label="Phone" required disabled={sameAsNok} error={errors.ecPhone?.message} registration={register('ecPhone')} />
        <FormField label="Relationship" required disabled={sameAsNok} error={errors.ecRelationship?.message} registration={register('ecRelationship')} />
      </div>
    </div>
  )
}
