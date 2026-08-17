import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useApiResource } from '../../lib/useApiResource'
import { listPackages } from '../../features/settings/packagesService'
import { toPackageOption } from '../../features/settings/packageMappers'
import { createStudent } from '../../features/students/shared/studentService'
import { toCreateStudentInput } from '../../features/students/secretary/registration/registerMapper'
import { detailsSchema, DETAILS_DEFAULTS, type DetailsFormValues } from '../../features/students/secretary/registration/schema'
import StepIndicator from '../../features/students/secretary/registration/StepIndicator'
import PersonalDetailsSection from '../../features/students/secretary/registration/PersonalDetailsSection'
import NextOfKinSection from '../../features/students/secretary/registration/NextOfKinSection'
import EmergencyContactSection from '../../features/students/secretary/registration/EmergencyContactSection'
import EnrolmentSection from '../../features/students/secretary/registration/EnrolmentSection'
import ReviewSummary from '../../features/students/secretary/registration/ReviewSummary'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import { ApiError } from '../../lib/apiError'
import { ROUTES } from '../../lib/constants'

type Phase = 'details' | 'review'

export default function RegisterStudentPage() {
  const navigate = useNavigate()

  // Live package catalogue (active only) — drives the enrolment picker and the
  // packageId/fee we send on create. No mock store: a mock package id would
  // break the real student_packages foreign key.
  const {
    data: packageRows, loading: packagesLoading, error: packagesError, refetch: refetchPackages,
  } = useApiResource(() => listPackages(true))
  const packages = (packageRows ?? []).map(toPackageOption)

  const [phase, setPhase] = useState<Phase>('details')
  const [finishing, setFinishing] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register, control, handleSubmit, watch, setValue, formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: DETAILS_DEFAULTS,
  })

  const onContinueToReview = handleSubmit(() => {
    setDuplicate(false)
    setSubmitError(null)
    setPhase('review')
  })

  // Shared submit path. The first attempt sends confirmDifferentPerson: false;
  // if the backend flags a possible duplicate (409) we surface the banner and
  // let the secretary resubmit with confirmDifferentPerson: true.
  const finish = async (confirmDifferentPerson: boolean) => {
    setFinishing(true)
    setSubmitError(null)
    // watch() reads react-hook-form's mutable store; this runs in a submit
    // handler (off the render path), so the compiler lint is safe to disable.
    // eslint-disable-next-line react-hooks/incompatible-library
    const values = watch()
    try {
      await createStudent(toCreateStudentInput(values, packages, confirmDifferentPerson))
      navigate(ROUTES.STUDENTS)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'POSSIBLE_DUPLICATE') {
        setDuplicate(true)
      } else {
        setSubmitError(err instanceof ApiError ? err.message : 'Could not register the student.')
      }
      setFinishing(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">Dashboard / Students / Register</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Register Student</h1>
          <Link to={ROUTES.STUDENTS} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
            <ArrowLeft size={14} /> Back to Students
          </Link>
        </div>
      </div>

      <StepIndicator phase={phase} />

      {phase === 'details' && (
        <div className="flex flex-col gap-4">
          <PersonalDetailsSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
          <NextOfKinSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
          <EmergencyContactSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />

          {packagesLoading ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <LoadingState message="Loading packages…" />
            </div>
          ) : packagesError ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <ErrorState error={packagesError} onRetry={refetchPackages} />
            </div>
          ) : (
            <EnrolmentSection
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              packages={packages}
            />
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onContinueToReview}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13.5px] font-medium rounded-lg transition-colors"
            >
              Continue to Review →
            </button>
          </div>
        </div>
      )}

      {phase === 'review' && (
        <div className="flex flex-col gap-4">
          {duplicate && (
            <div className="bg-danger-bg border border-danger/20 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
                <p className="text-[13.5px] font-medium text-danger">
                  Possible duplicate — a student with a matching name or phone number already exists.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={finishing}
                  onClick={() => finish(true)}
                  className="px-3 py-1.5 text-[12.5px] font-medium text-white bg-danger hover:opacity-90 disabled:opacity-50 rounded-md transition-colors"
                >
                  {finishing ? 'Registering…' : 'Register Anyway — Different Person'}
                </button>
              </div>
            </div>
          )}

          {submitError && (
            <div className="bg-danger-bg border border-danger/20 rounded-2xl p-4 flex items-start gap-2">
              <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
              <p className="text-[13.5px] text-danger">{submitError}</p>
            </div>
          )}

          <ReviewSummary values={watch()} />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => {
                setDuplicate(false)
                setSubmitError(null)
                setPhase('details')
              }}
              className="px-5 py-2.5 text-[13.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={finishing || duplicate}
              onClick={() => finish(false)}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13.5px] font-medium rounded-lg transition-colors"
            >
              {finishing ? 'Registering…' : 'Finish'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
