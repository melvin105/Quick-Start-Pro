import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import RegisterShell from '../../features/students/public/RegisterShell'
import PersonalSection from '../../features/students/public/PersonalSection'
import NextOfKinSection from '../../features/students/public/NextOfKinSection'
import EmergencyContactSection from '../../features/students/public/EmergencyContactSection'
import {
  publicRegistrationSchema, PUBLIC_REGISTRATION_DEFAULTS, type PublicRegistrationValues,
} from '../../features/students/public/registrationSchema'
import { submitRegistration } from '../../features/registrations/registrationService'
import { toSubmitInput } from '../../features/students/public/registrationMapper'
import { ApiError } from '../../lib/apiError'

export default function RegisterPage() {
  const { token = '' } = useParams<{ token: string }>()
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting },
  } = useForm<PublicRegistrationValues>({
    resolver: zodResolver(publicRegistrationSchema),
    defaultValues: PUBLIC_REGISTRATION_DEFAULTS,
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await submitRegistration(toSubmitInput(values), token)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your registration. Please try again.')
    }
  })

  if (submitted) {
    return (
      <RegisterShell>
        <div className="bg-white rounded-2xl shadow-card p-8 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-success-bg text-success flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-gray-900">Form submitted, thank you!</h1>
          </div>
        </div>
      </RegisterShell>
    )
  }

  return (
    <RegisterShell>
      <div className="flex flex-col gap-1 mb-5 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Student Registration</h1>
        <p className="text-[13px] text-gray-500">
          Fill in your details below. A member of staff will complete your enrolment once submitted.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <PersonalSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <NextOfKinSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <EmergencyContactSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-[13px] text-danger">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-[14px] font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Registration'}
        </button>
      </form>
    </RegisterShell>
  )
}
