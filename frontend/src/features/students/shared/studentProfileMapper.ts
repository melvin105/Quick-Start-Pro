import { toLicenceProgress } from './licenceMappers'
import { displayStatus, enrolmentLabel } from './studentMappers'
import type { ApiStudentProfile } from './studentService'
import type { EnrolmentType, IdCardType, Student } from './types'

export function toStudentProfile(row: ApiStudentProfile): Student {
  const emergency = row.emergency_contact?.trim() || 'Not provided'

  return {
    id:             row.id,
    studentNumber:  row.student_number,
    firstName:      row.first_name,
    lastName:       row.last_name,
    name:           row.student_name,
    dob:            row.dob ?? '',
    gender:         row.gender === 'female' ? 'female' : 'male',
    phone:          row.phone,
    email:          row.email ?? undefined,
    address:        row.address ?? undefined,
    photo:          row.photo_url ?? undefined,
    idCardType:     row.id_card_type ? row.id_card_type as IdCardType : undefined,
    idCardNumber:   row.ghana_card_no ?? undefined,
    nextOfKin:      { name: emergency, phone: '', relationship: '' },
    emergencyContact: { name: emergency, phone: '', relationship: '' },
    enrolment:      enrolmentLabel(row.enrolment_type) as EnrolmentType,
    programme:      row.package_name ?? undefined,
    balance:        row.balance,
    status:         displayStatus(row),
    registrationDate: row.registration_date ?? undefined,
    packageFee:       row.total_fees,
    lessonsPackageTotal: row.total_lessons,
    lessonsTaken:        row.lessons_used,
    licenceProgress:     toLicenceProgress(row),
  }
}
