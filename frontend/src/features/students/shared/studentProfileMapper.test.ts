import { describe, expect, it } from 'vitest'
import { toStudentProfile } from './studentProfileMapper'
import type { ApiStudentProfile } from './studentService'

const profile: ApiStudentProfile = {
  id: 'uuid-1', student_number: 'DP-2026-0001', student_name: 'Ama Mensah',
  first_name: 'Ama', last_name: 'Mensah', dob: '2001-04-05', gender: 'female',
  status: 'active', enrolment_type: 'driving_and_licence', phone: '0240000000',
  email: null, address: 'Spintex', emergency_contact: 'Kojo Mensah — 0550000000',
  ghana_card_no: 'GHA-123', photo_url: null, registration_date: '2026-08-01',
  total_fees: 1500, total_paid: 500, balance: 1000, total_lessons: 12,
  lessons_used: 3, lessons_left: 9, package_name: 'Complete Driver',
  eye_test_done: true, eye_test_date: '2026-08-02', learner_licence_issued: false,
  learner_licence_date: null, exam_date: null, exam_result: null,
  licence_issued: false, licence_issued_date: null,
}

describe('toStudentProfile', () => {
  it('maps the authoritative API profile into the existing profile view model', () => {
    const student = toStudentProfile(profile)

    expect(student).toMatchObject({
      id: 'uuid-1', studentNumber: 'DP-2026-0001', name: 'Ama Mensah',
      enrolment: 'Driving + Licence', programme: 'Complete Driver',
      balance: 1000, status: 'outstanding', packageFee: 1500,
      lessonsPackageTotal: 12, lessonsTaken: 3,
    })
    expect(student.licenceProgress?.eyeTest).toEqual({ done: true, dateDone: '2026-08-02' })
  })
})
