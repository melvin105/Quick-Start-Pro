import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import { useApiResource } from '../../lib/useApiResource'
import { getStudent, updateStudent, type ApiStudentProfile, type ApiEnrolmentType } from '../../features/students/shared/studentService'
import { enrolmentLabel } from '../../features/students/shared/studentMappers'
import { editSchema } from '../../features/students/secretary/edit/editSchema'
import { toEditFormValues, toUpdateStudentInput } from '../../features/students/secretary/edit/editMapper'
import { type DetailsFormValues } from '../../features/students/secretary/registration/schema'
import PersonalDetailsSection from '../../features/students/secretary/registration/PersonalDetailsSection'
import FormField from '../../features/students/secretary/registration/FormField'
import Dropdown from '../../features/students/secretary/registration/Dropdown'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import { ApiError } from '../../lib/apiError'
import { ROUTES } from '../../lib/constants'

const ENROLMENT_TYPES: ApiEnrolmentType[] = ['driving_and_licence', 'driving_only', 'licence_only']

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

  const [enrolmentType, setEnrolmentType] = useState<ApiEnrolmentType>(profile.enrolment_type)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const onSave = handleSubmit(async (values) => {
    setSaving(true)
    setSaveError(null)
    try {
      await updateStudent(id, toUpdateStudentInput(values, enrolmentType))
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
        <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Enrolment</h2>
        <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Enrolment Type <span className="text-danger">*</span></label>
        <div className="sm:max-w-xs">
          <Dropdown
            value={enrolmentType}
            onChange={(value) => setEnrolmentType(value as ApiEnrolmentType)}
            placeholder="Select enrolment"
            options={ENROLMENT_TYPES.map((t) => ({ value: t, label: enrolmentLabel(t) }))}
          />
        </div>
        <p className="text-[12px] text-gray-500 mt-2">
          Package, next-of-kin and notes aren't editable here.
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
