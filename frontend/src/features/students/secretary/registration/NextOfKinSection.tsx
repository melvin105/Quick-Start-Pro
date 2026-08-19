import FormField from './FormField'
import Dropdown from './Dropdown'
import ControlledFormField from '../../shared/ControlledFormField'
import { Controller } from 'react-hook-form'
import { formatPhoneInput, RELATIONSHIP_OPTIONS } from '../../shared/registrationFormats'
import type { FormSectionProps } from './formTypes'

export default function NextOfKinSection({ register, control, errors }: FormSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Next of Kin</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Name" required error={errors.nokName?.message} registration={register('nokName')} />
        <div><label className="block text-[13px] font-medium text-gray-800 mb-1.5">Relationship <span className="text-danger">*</span></label><Controller name="nokRelationship" control={control} render={({ field }) => <Dropdown value={field.value} onChange={field.onChange} placeholder="Select relationship" options={RELATIONSHIP_OPTIONS} />} />{errors.nokRelationship && <p className="text-[12px] text-danger mt-1">{errors.nokRelationship.message}</p>}</div>
        <ControlledFormField control={control} name="nokPhone" label="Phone Number" required error={errors.nokPhone?.message} inputMode="tel" placeholder="024 123 4567" formatter={formatPhoneInput} />
        <FormField label="Email Address" type="email" error={errors.nokEmail?.message} registration={register('nokEmail')} />
      </div>
    </div>
  )
}
