import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import useStudentsStore from '../../features/students/shared/store'
import usePackagesStore from '../../features/settings/packagesStore'
import { deriveEnrolment } from '../../features/settings/enrolment'
import { detailsSchema, DETAILS_DEFAULTS, type DetailsFormValues } from '../../features/students/secretary/registration/schema'
import StepIndicator from '../../features/students/secretary/registration/StepIndicator'
import PersonalDetailsSection from '../../features/students/secretary/registration/PersonalDetailsSection'
import NextOfKinSection from '../../features/students/secretary/registration/NextOfKinSection'
import EmergencyContactSection from '../../features/students/secretary/registration/EmergencyContactSection'
import EnrolmentSection from '../../features/students/secretary/registration/EnrolmentSection'
import ReviewSummary from '../../features/students/secretary/registration/ReviewSummary'
import StudentAvatar from '../../features/students/shared/StudentAvatar'
import { ROUTES } from '../../lib/constants'
import { studentProfilePath, MAX_LESSONS } from '../../features/students/shared/utils'
import type { Student } from '../../features/students/shared/types'

type Phase = 'details' | 'review'

export default function RegisterStudentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resumeId = searchParams.get('resume')

  const students = useStudentsStore((s) => s.students)
  const pending = useStudentsStore((s) => s.pending)
  const addStudent = useStudentsStore((s) => s.addStudent)
  const removePending = useStudentsStore((s) => s.removePending)
  const nextStudentId = useStudentsStore((s) => s.nextStudentId)
  const packages = usePackagesStore((s) => s.packages)

  const resumeRecord = resumeId ? pending.find((p) => p.id === resumeId) : undefined

  const [phase, setPhase] = useState<Phase>('details')
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false)
  const [finishing, setFinishing] = useState(false)

  const {
    register, control, handleSubmit, watch, setValue, formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: resumeRecord
      ? {
          ...DETAILS_DEFAULTS,
          firstName: resumeRecord.firstName,
          lastName:  resumeRecord.lastName,
          dob:       resumeRecord.dob,
          gender:    resumeRecord.gender === 'other' ? 'male' : resumeRecord.gender,
          phone:     resumeRecord.phone,
          email:     resumeRecord.email ?? '',
          address:   resumeRecord.address ?? '',
          passportPhoto: resumeRecord.photo ?? '',
          idCardType:   resumeRecord.idCardType ?? '',
          idCardNumber: resumeRecord.idCardNumber ?? '',
          nokName:         resumeRecord.nextOfKin.name,
          nokRelationship: resumeRecord.nextOfKin.relationship,
          nokPhone:        resumeRecord.nextOfKin.phone,
          nokEmail:        resumeRecord.nextOfKin.email ?? '',
          ecName:         resumeRecord.emergencyContact.name,
          ecPhone:        resumeRecord.emergencyContact.phone,
          ecRelationship: resumeRecord.emergencyContact.relationship,
        }
      : DETAILS_DEFAULTS,
  })

  useEffect(() => {
    if (resumeId && !resumeRecord) {
      navigate(ROUTES.STUDENTS, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId])

  const firstName = watch('firstName')
  const lastName = watch('lastName')
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim()

  const duplicateMatch = useMemo(() => {
    if (finishing || phase !== 'review' || !fullName) return undefined
    return students.find((s) => s.name.trim().toLowerCase() === fullName.toLowerCase())
  }, [finishing, phase, fullName, students])

  const onContinueToReview = handleSubmit(() => {
    setDuplicateConfirmed(false)
    setPhase('review')
  })

  const onFinish = () => {
    // addStudent() below adds the new student to the same `students` array
    // duplicateMatch watches — without this guard, the name-match memo would
    // recompute against the record that was just created (matching itself)
    // and flash the "possible duplicate" banner for a render before the
    // route change away from this page takes effect.
    setFinishing(true)
    const values = watch()
    const id = nextStudentId()
    const matchedPackage = packages.find((p) => p.name === values.programme)
    const student: Student = {
      id,
      firstName: values.firstName,
      lastName:  values.lastName,
      name:      fullName,
      dob:       values.dob,
      gender:    values.gender,
      phone:     values.phone,
      email:     values.email || undefined,
      address:   values.address || undefined,
      photo:        values.passportPhoto || undefined,
      idCardType:   (values.idCardType as Student['idCardType']) || undefined,
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
      enrolment:    deriveEnrolment(values.programme),
      programme:    values.programme,
      notes:        values.notes || undefined,
      packageFee:          matchedPackage?.price,
      lessonsPackageTotal: MAX_LESSONS,
      lessonsTaken:        0,
      balance: matchedPackage?.price ?? 0,
      status: 'active',
    }
    addStudent(student)
    if (resumeRecord) removePending(resumeRecord.id)
    navigate(studentProfilePath(id))
  }

  const canFinish = !duplicateMatch || duplicateConfirmed

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">
          Dashboard / Students / {resumeRecord ? 'Complete Registration' : 'Register'}
        </p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {resumeRecord ? `Complete Registration — ${resumeRecord.name}` : 'Register Student'}
          </h1>
          <Link to={ROUTES.STUDENTS} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
            <ArrowLeft size={14} /> Back to Students
          </Link>
        </div>
      </div>

      <StepIndicator phase={phase} />

      {phase === 'details' && (
        <div className="flex flex-col gap-4">
          {resumeRecord && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Submitted by Student
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <StudentAvatar name={resumeRecord.name} photo={resumeRecord.photo} className="w-14 h-14 text-[17px]" />
                <p className="text-[15px] font-semibold text-gray-900">{resumeRecord.name}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[13.5px]">
                <p><span className="text-gray-500">Name:</span> <span className="text-gray-900 font-medium">{resumeRecord.name}</span></p>
                <p><span className="text-gray-500">Phone:</span> <span className="text-gray-900">{resumeRecord.phone}</span></p>
                <p><span className="text-gray-500">Date of Birth:</span> <span className="text-gray-900">{resumeRecord.dob}</span></p>
                <p><span className="text-gray-500">Gender:</span> <span className="text-gray-900 capitalize">{resumeRecord.gender}</span></p>
                <p><span className="text-gray-500">Address:</span> <span className="text-gray-900">{resumeRecord.address ?? '—'}</span></p>
                <p><span className="text-gray-500">ID:</span> <span className="text-gray-900">{resumeRecord.idCardType ? `${resumeRecord.idCardType} - ${resumeRecord.idCardNumber ?? ''}` : '—'}</span></p>
                <p><span className="text-gray-500">Next of Kin:</span> <span className="text-gray-900">{resumeRecord.nextOfKin.name} ({resumeRecord.nextOfKin.relationship}) — {resumeRecord.nextOfKin.phone}</span></p>
                <p><span className="text-gray-500">Emergency Contact:</span> <span className="text-gray-900">{resumeRecord.emergencyContact.name} ({resumeRecord.emergencyContact.relationship}) — {resumeRecord.emergencyContact.phone}</span></p>
              </div>
            </div>
          )}

          {!resumeRecord && (
            <>
              <PersonalDetailsSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
              <NextOfKinSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
              <EmergencyContactSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
            </>
          )}

          <EnrolmentSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />

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
          {duplicateMatch && (
            <div className="bg-danger-bg border border-danger/20 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
                <p className="text-[13.5px] font-medium text-danger">
                  Possible duplicate detected — A student named "{duplicateMatch.name}" ({duplicateMatch.phone}) already exists.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={studentProfilePath(duplicateMatch.id)}
                  className="px-3 py-1.5 text-[12.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  View Existing Profile
                </Link>
                <button
                  type="button"
                  onClick={() => setDuplicateConfirmed(true)}
                  className="px-3 py-1.5 text-[12.5px] font-medium text-white bg-danger hover:opacity-90 rounded-md transition-colors"
                >
                  Proceed Anyway — Confirm Different Person
                </button>
              </div>
            </div>
          )}

          <ReviewSummary values={watch()} />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setPhase('details')}
              className="px-5 py-2.5 text-[13.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={!canFinish}
              onClick={onFinish}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13.5px] font-medium rounded-lg transition-colors"
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
