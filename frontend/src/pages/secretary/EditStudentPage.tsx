import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import { useApiResource } from '../../lib/useApiResource'
import { getStudent, updateStudent, assignStudentPackage, type ApiStudentProfile, type ApiEnrolmentType } from '../../features/students/shared/studentService'
import { enrolmentEnum } from '../../features/students/shared/studentMappers'
import { listPackages } from '../../features/settings/packagesService'
import { toPackageOption } from '../../features/settings/packageMappers'
import { deriveEnrolment } from '../../features/settings/enrolment'
import { formatGHS } from '../../features/payments/utils'
import { editSchema } from '../../features/students/secretary/edit/editSchema'
import { toEditFormValues, toUpdateStudentInput } from '../../features/students/secretary/edit/editMapper'
import { type DetailsFormValues } from '../../features/students/secretary/registration/schema'
import PersonalDetailsSection from '../../features/students/secretary/registration/PersonalDetailsSection'
import FormField from '../../features/students/secretary/registration/FormField'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import { ApiError } from '../../lib/apiError'
import { ROUTES } from '../../lib/constants'

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>()
  const { data: profile, loading, error, refetch } = useApiResource(
    () => getStudent(id as string),
    [id],
  )

  if (loading) return <LoadingState message="Loading student…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!profile) return null

  // Keyed by id so navigating between students remounts the form with fresh
  // defaults — the initial values come straight from props, no effect syncing.
  return <EditStudentForm key={profile.id} id={id as string} profile={profile} />
}

function EditStudentForm({ id, profile }: { id: string; profile: ApiStudentProfile }) {
  const navigate = useNavigate()

  // editSchema relaxes the non-rendered fields (next-of-kin, package, notes) to
  // optional, so its resolver input type is a touch looser than DetailsFormValues.
  // The runtime shape is identical (those fields default to ''), so the form is
  // typed to DetailsFormValues and the resolver cast to match.
  const {
    register, control, handleSubmit, watch, setValue, formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(editSchema) as Resolver<DetailsFormValues>,
    defaultValues: toEditFormValues(profile),
  })

  // Active packages — the enrolment type is derived from the chosen package's
  // name (same rule as the register wizard and Complete Registration modal), so
  // the desk picks a package here rather than an enrolment type directly.
  const { data: packageRows, loading: packagesLoading, error: packagesError } = useApiResource(() => listPackages(true))
  const packages = (packageRows ?? []).map(toPackageOption)
  // The student's current package, matched by name (the profile row carries the
  // name, not the id). Used as the default selection and to skip a needless
  // re-assign when the package is left unchanged.
  const currentPackageId = packages.find((p) => p.name === profile.package_name)?.id ?? null

  // `picked` is the staff's explicit choice; until they touch a card the form
  // shows the current package. `?? currentPackageId` also lets the default fill
  // in once the packages finish loading, no effect syncing required.
  const [picked, setPicked] = useState<string | null>(null)
  const selectedPackageId = picked ?? currentPackageId
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const onSave = handleSubmit(async (values) => {
    setSaving(true)
    setSaveError(null)
    try {
      // Derive the enrolment bucket from the picked package; keep the student's
      // existing enrolment if no package could be resolved (empty catalogue).
      const pkg = packages.find((p) => p.id === selectedPackageId)
      const enrolmentType: ApiEnrolmentType =
        (pkg && enrolmentEnum(deriveEnrolment(pkg.name))) || profile.enrolment_type

      await updateStudent(id, toUpdateStudentInput(values, enrolmentType))
      // Only re-link when the package actually changed (assign replaces the row
      // and re-sets the fee, so avoid it on an unchanged edit).
      if (selectedPackageId && selectedPackageId !== currentPackageId) {
        await assignStudentPackage(id, selectedPackageId)
      }
      navigate(ROUTES.STUDENTS)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save changes.')
      setSaving(false)
    }
  })

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">Dashboard / Students / {profile.student_name} / Edit</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Student</h1>
          <Link to={ROUTES.STUDENTS} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
            <ArrowLeft size={14} /> Back to Students
          </Link>
        </div>
      </div>

      <PersonalDetailsSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Emergency Contact</h2>
        <FormField
          label="Contact (name, relationship, phone)"
          required
          error={errors.ecName?.message}
          registration={register('ecName')}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Package</h2>
        {packagesLoading ? (
          <p className="text-[12.5px] text-gray-500">Loading packages…</p>
        ) : packagesError || packages.length === 0 ? (
          <p className="text-[12.5px] text-gray-500">
            No packages available. Add one under Settings to change this student's package.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                disabled={saving}
                onClick={() => setPicked(pkg.id)}
                className={`text-left px-4 py-3 rounded-xl border-2 transition-colors disabled:opacity-60 ${
                  selectedPackageId === pkg.id ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`text-[13.5px] font-medium ${selectedPackageId === pkg.id ? 'text-brand-600' : 'text-gray-800'}`}>
                  {pkg.name}
                </p>
                <p className={`text-[12px] mt-0.5 ${selectedPackageId === pkg.id ? 'text-brand-600/80' : 'text-gray-500'}`}>
                  {formatGHS(pkg.price)}
                </p>
              </button>
            ))}
          </div>
        )}
        <p className="text-[12px] text-gray-500 mt-3">
          The selected package determines the fee and enrolment type. Next-of-kin details and notes are read-only here.
        </p>
      </div>

      {saveError && (
        <div className="bg-danger-bg border border-danger/20 rounded-2xl p-4">
          <p className="text-[13.5px] text-danger">{saveError}</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Link
          to={ROUTES.STUDENTS}
          className="px-5 py-2.5 text-[13.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-[13.5px] font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
