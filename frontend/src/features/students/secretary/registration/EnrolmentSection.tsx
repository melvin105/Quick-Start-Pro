import { Controller } from 'react-hook-form'
import { formatGHS } from '../../../payments/utils'
import type { FormSectionProps } from './formTypes'
import type { PackageOption } from '../../../settings/packageMappers'

interface EnrolmentSectionProps extends FormSectionProps {
  // Live packages (GET /packages) — the picker's id is sent as packageId, and
  // the enrolment type is derived from the selected name on submit.
  packages: PackageOption[]
}

export default function EnrolmentSection({ register, control, errors, packages }: EnrolmentSectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Enrolment</h2>

      <div className="mb-4">
        <label className="block text-[13px] font-medium text-gray-800 mb-2">
          Package <span className="text-danger">*</span>
        </label>
        <Controller
          name="programme"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => field.onChange(pkg.name)}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                    field.value === pkg.name ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className={`text-[13.5px] font-medium ${field.value === pkg.name ? 'text-brand-600' : 'text-gray-800'}`}>
                    {pkg.name}
                  </p>
                  <p className={`text-[12px] mt-0.5 ${field.value === pkg.name ? 'text-brand-600/80' : 'text-gray-500'}`}>
                    {formatGHS(pkg.price)}
                  </p>
                </button>
              ))}
            </div>
          )}
        />
        {errors.programme && <p className="text-[12px] text-danger mt-1">{errors.programme.message}</p>}
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
