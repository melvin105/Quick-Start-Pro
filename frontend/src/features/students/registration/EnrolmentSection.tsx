import { Controller } from 'react-hook-form'
import FormField from './FormField'
import Dropdown from './Dropdown'
import { PROGRAMMES_BY_ENROLMENT } from '../mockData'
import type { EnrolmentType } from '../types'
import type { FormSectionProps } from './formTypes'

const ENROLMENT_TYPES: EnrolmentType[] = ['Driving Only', 'Licence Only', 'Driving + Licence']

export default function EnrolmentSection({ register, control, errors, watch, setValue }: FormSectionProps) {
  const enrolment = watch('enrolment')
  const programme = watch('programme')
  const programmeOptions = enrolment ? PROGRAMMES_BY_ENROLMENT[enrolment] : []

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Enrolment</h2>

      <div className="mb-4">
        <label className="block text-[13px] font-medium text-gray-800 mb-2">
          Enrolment Type <span className="text-danger">*</span>
        </label>
        <Controller
          name="enrolment"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ENROLMENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    field.onChange(type)
                    if (programme && !PROGRAMMES_BY_ENROLMENT[type].includes(programme)) {
                      setValue('programme', '')
                    }
                  }}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                    field.value === type ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`text-[13.5px] font-medium ${field.value === type ? 'text-brand-600' : 'text-gray-800'}`}>
                    {type}
                  </p>
                </button>
              ))}
            </div>
          )}
        />
        {errors.enrolment && <p className="text-[12px] text-danger mt-1">{errors.enrolment.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">
            Programme <span className="text-danger">*</span>
          </label>
          <Controller
            name="programme"
            control={control}
            render={({ field }) => (
              <Dropdown
                value={field.value}
                onChange={field.onChange}
                disabled={!enrolment}
                placeholder={enrolment ? 'Select a programme' : 'Select an enrolment type first'}
                options={programmeOptions.map((p) => ({ value: p, label: p }))}
              />
            )}
          />
          {errors.programme && <p className="text-[12px] text-danger mt-1">{errors.programme.message}</p>}
        </div>
        <FormField
          label="Assigned Slot (optional)"
          placeholder="Can be set later in Schedule"
          registration={register('assignedSlot')}
        />
      </div>

      <div className="mt-4">
        <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Notes</label>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Any additional notes..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 resize-none
            focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-colors"
        />
      </div>
    </div>
  )
}
