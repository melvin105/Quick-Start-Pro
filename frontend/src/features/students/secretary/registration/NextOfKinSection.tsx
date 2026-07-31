import FormField from './FormField'
import type { FormSectionProps } from './formTypes'

export default function NextOfKinSection({ register, errors }: FormSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Next of Kin</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Name" required error={errors.nokName?.message} registration={register('nokName')} />
        <FormField label="Relationship" required error={errors.nokRelationship?.message} registration={register('nokRelationship')} />
        <FormField label="Phone Number" required error={errors.nokPhone?.message} registration={register('nokPhone')} />
        <FormField label="Email Address" type="email" error={errors.nokEmail?.message} registration={register('nokEmail')} />
      </div>
    </div>
  )
}
