import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import useStudentsStore from '../../features/students/shared/store'
import { detailsSchema, type DetailsFormValues } from '../../features/students/secretary/registration/schema'
import PersonalDetailsSection from '../../features/students/secretary/registration/PersonalDetailsSection'
import NextOfKinSection from '../../features/students/secretary/registration/NextOfKinSection'
import EmergencyContactSection from '../../features/students/secretary/registration/EmergencyContactSection'
import EnrolmentSection from '../../features/students/secretary/registration/EnrolmentSection'
import { ROUTES } from '../../lib/constants'
import { studentProfilePath } from '../../features/students/shared/utils'

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const student = useStudentsStore((s) => s.students.find((st) => st.id === id))
  const updateStudent = useStudentsStore((s) => s.updateStudent)

  const {
    register, control, handleSubmit, watch, setValue, formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: student
      ? {
          firstName: student.firstName,
          lastName:  student.lastName,
          dob:       student.dob,
          gender:    student.gender,
          phone:     student.phone,
          email:     student.email ?? '',
          address:   student.address ?? '',
          ghanaCardNumber: student.ghanaCardNumber ?? '',
          nokName:         student.nextOfKin.name,
          nokRelationship: student.nextOfKin.relationship,
          nokPhone:        student.nextOfKin.phone,
          nokAddress:      student.nextOfKin.address ?? '',
          sameAsNok: false,
          ecName:         student.emergencyContact.name,
          ecPhone:        student.emergencyContact.phone,
          ecRelationship: student.emergencyContact.relationship,
          enrolment:    student.enrolment,
          programme:    student.programme ?? '',
          assignedSlot: student.assignedSlot ?? '',
          notes:        student.notes ?? '',
        }
      : undefined,
  })

  if (!student) {
    return <Navigate to={ROUTES.STUDENTS} replace />
  }

  const onSave = handleSubmit((values) => {
    updateStudent(student.id, {
      firstName: values.firstName,
      lastName:  values.lastName,
      name:      `${values.firstName} ${values.lastName}`.trim(),
      dob:       values.dob,
      gender:    values.gender,
      phone:     values.phone,
      email:     values.email || undefined,
      address:   values.address || undefined,
      ghanaCardNumber: values.ghanaCardNumber || undefined,
      nextOfKin: {
        name: values.nokName,
        relationship: values.nokRelationship,
        phone: values.nokPhone,
        address: values.nokAddress || undefined,
      },
      emergencyContact: {
        name: values.ecName,
        phone: values.ecPhone,
        relationship: values.ecRelationship,
      },
      enrolment:    values.enrolment,
      programme:    values.programme,
      assignedSlot: values.assignedSlot || undefined,
      notes:        values.notes || undefined,
    })
    navigate(studentProfilePath(student.id))
  })

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">Dashboard / Students / {student.name} / Edit</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit Student</h1>
          <Link
            to={studentProfilePath(student.id)}
            className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0"
          >
            <ArrowLeft size={14} /> Back to Profile
          </Link>
        </div>
      </div>

      <PersonalDetailsSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
      <NextOfKinSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
      <EmergencyContactSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />
      <EnrolmentSection register={register} control={control} errors={errors} watch={watch} setValue={setValue} />

      <div className="flex justify-end gap-2">
        <Link
          to={studentProfilePath(student.id)}
          className="px-5 py-2.5 text-[13.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={onSave}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13.5px] font-medium rounded-lg transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
