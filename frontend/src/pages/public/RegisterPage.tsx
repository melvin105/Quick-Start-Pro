import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle2 } from 'lucide-react'
import useStudentsStore from '../../features/students/shared/store'
import { nextPendingId } from '../../features/students/shared/utils'
import RegisterShell from '../../features/students/public/RegisterShell'
import PersonalSection from '../../features/students/public/PersonalSection'
import NextOfKinSection from '../../features/students/public/NextOfKinSection'
import EmergencyContactSection from '../../features/students/public/EmergencyContactSection'
import {
  publicRegistrationSchema, PUBLIC_REGISTRATION_DEFAULTS, type PublicRegistrationValues,
} from '../../features/students/public/registrationSchema'
import type { PendingSubmission } from '../../features/students/shared/types'

export default function RegisterPage() {
  const addPending = useStudentsStore((s) => s.addPending)
  const [submitted, setSubmitted] = useState(false)

  const {
    register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting },
  } = useForm<PublicRegistrationValues>({
    resolver: zodResolver(publicRegistrationSchema),
    defaultValues: PUBLIC_REGISTRATION_DEFAULTS,
  })

  const onSubmit = handleSubmit((values) => {
    const submission: PendingSubmission = {
      id: nextPendingId(),
      name: `${values.firstName} ${values.lastName}`.trim(),
      phone: values.phone,
      submittedLabel: 'Just now',
      firstName: values.firstName,
      lastName:  values.lastName,
      dob:       values.dob,
      gender:    values.gender,
      email:     values.email || undefined,
      address:   values.address || undefined,
      photo:     values.passportPhoto || undefined,
      idCardType:   (values.idCardType as PendingSubmission['idCardType']) || undefined,
      idCardNumber: values.idCardNumber || undefined,
      nextOfKin: {
        name: values.nokName,
        relationship: values.nokRelationship,
        phone: values.nokPhone,
        email: values.nokEmail || undefined,
      },
      emergencyContact: {
        name: values.ecName,
        phone: values.ecPhone,
        relationship: values.ecRelationship,
      },
    }
    addPending(submission)
    setSubmitted(true)
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-[14px] font-medium rounded-lg transition-colors"
        >
          Submit Registration
        </button>
      </form>
    </RegisterShell>
  )
}
