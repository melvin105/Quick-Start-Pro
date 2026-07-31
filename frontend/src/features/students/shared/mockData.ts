import type { Student, PendingSubmission } from './types'

export const STUDENTS: Student[] = [
  {
    id: 'QS-2025-001', firstName: 'John', lastName: 'Mensah', name: 'John Mensah',
    dob: '2001-03-12', gender: 'male', phone: '024 111 2233', email: 'john.mensah@gmail.com',
    address: 'East Legon, Accra', idCardType: 'Ghana Card', idCardNumber: 'GHA-023456789-0',
    nextOfKin:        { name: 'Grace Mensah',  relationship: 'Mother', phone: '024 555 7788' },
    emergencyContact: { name: 'Grace Mensah',  relationship: 'Mother', phone: '024 555 7788' },
    enrolment: 'Driving + Licence', programme: 'Driving + Licence', balance: 500, status: 'outstanding',
    registrationDate: '2025-07-01',
    packageFee: 3200, lessonsPackageTotal: 15, lessonsTaken: 10,
    licenceProgress: {
      eyeTest:        { done: true, dateDone: '2026-06-02' },
      learnerLicence: { issued: true, dateIssued: '2026-06-15' },
      examDate:       {},
      fullLicence:    { issued: false },
    },
  },
  {
    id: 'QS-2025-002', firstName: 'Mary', lastName: 'Owusu', name: 'Mary Owusu',
    dob: '2000-09-03', gender: 'female', phone: '020 445 8871', email: 'mary.owusu@example.com',
    address: 'Bomso, Kumasi', idCardType: 'Ghana Card', idCardNumber: 'GHA-000333444',
    nextOfKin:        { name: 'Samuel Owusu', relationship: 'Father', phone: '020 445 1120' },
    emergencyContact: { name: 'Samuel Owusu', relationship: 'Father', phone: '020 445 1120' },
    enrolment: 'Licence Only', programme: 'Licence Only', balance: 0, status: 'active',
    packageFee: 1200, lessonsPackageTotal: 15, lessonsTaken: 3,
  },
  {
    id: 'QS-2025-003', firstName: 'Kwesi', lastName: 'Boateng', name: 'Kwesi Boateng',
    dob: '1995-01-20', gender: 'male', phone: '055 902 1140',
    address: 'Kotei, Kumasi',
    nextOfKin:        { name: 'Efua Boateng', relationship: 'Sister', phone: '055 902 9981' },
    emergencyContact: { name: 'Efua Boateng', relationship: 'Sister', phone: '055 902 9981' },
    enrolment: 'Driving Only', programme: 'Driving Only', balance: 0, status: 'active',
    packageFee: 2000, lessonsPackageTotal: 15, lessonsTaken: 12,
  },
  {
    id: 'QS-2025-004', firstName: 'Ama', lastName: 'Asante', name: 'Ama Asante',
    dob: '1999-11-08', gender: 'female', phone: '027 883 0092',
    address: 'Ahodwo, Kumasi', idCardType: 'Ghana Card', idCardNumber: 'GHA-000777888',
    nextOfKin:        { name: 'Yaw Asante', relationship: 'Brother', phone: '027 883 1200' },
    emergencyContact: { name: 'Yaw Asante', relationship: 'Brother', phone: '027 883 1200' },
    enrolment: 'Driving + Licence', programme: 'Driving + Licence', balance: 0, status: 'active',
    packageFee: 3200, lessonsPackageTotal: 15, lessonsTaken: 8,
  },
  {
    id: 'QS-2025-005', firstName: 'Yaw', lastName: 'Darko', name: 'Yaw Darko',
    dob: '1997-06-30', gender: 'male', phone: '050 214 7765',
    address: 'Deduako, Kumasi',
    nextOfKin:        { name: 'Abena Darko', relationship: 'Wife', phone: '050 214 0099' },
    emergencyContact: { name: 'Abena Darko', relationship: 'Wife', phone: '050 214 0099' },
    enrolment: 'Driving Only', programme: 'Driving Only', balance: 0, status: 'completed',
    packageFee: 2000, lessonsPackageTotal: 15, lessonsTaken: 15,
  },
  // Seeded so the QR hand-off "simulate submission" demo can trigger the
  // name-based duplicate-detection banner on the Review step.
  {
    id: 'QS-2025-006', firstName: 'Akwasi', lastName: 'Asenso', name: 'Akwasi Asenso',
    dob: '1996-07-19', gender: 'male', phone: '055 712 3456',
    address: 'Kotei, Kumasi',
    nextOfKin:        { name: 'Comfort Asenso', relationship: 'Mother', phone: '024 887 1122' },
    emergencyContact: { name: 'Comfort Asenso', relationship: 'Mother', phone: '024 887 1122' },
    enrolment: 'Driving Only', programme: 'Driving Only', balance: 0, status: 'active',
    packageFee: 2000, lessonsPackageTotal: 15, lessonsTaken: 1,
  },
]

export const PENDING_SUBMISSIONS: PendingSubmission[] = [
  {
    id: 'pending-1', name: 'Kofi Mensah', phone: '055 411 2233', submittedLabel: 'Today, 10:14am',
    firstName: 'Kofi', lastName: 'Mensah', dob: '2002-02-14', gender: 'male',
    address: 'Ayeduase Gate, Kumasi',
    nextOfKin:        { name: 'Akosua Mensah', relationship: 'Mother', phone: '055 411 9900' },
    emergencyContact: { name: 'Akosua Mensah', relationship: 'Mother', phone: '055 411 9900' },
  },
  {
    id: 'pending-2', name: 'Ama Serwaa', phone: '024 198 7654', submittedLabel: 'Today, 09:30am',
    firstName: 'Ama', lastName: 'Serwaa', dob: '2001-10-05', gender: 'female',
    address: 'Bomso, Kumasi',
    nextOfKin:        { name: 'Kwabena Serwaa', relationship: 'Father', phone: '024 198 0021' },
    emergencyContact: { name: 'Kwabena Serwaa', relationship: 'Father', phone: '024 198 0021' },
  },
]

// Demo data used by the QR hand-off "Simulate Student Submission" button —
// intentionally the same name as QS-2025-006 to demonstrate duplicate detection.
export function buildSimulatedSubmission(phone: string): PendingSubmission {
  return {
    id: `pending-${Date.now()}`,
    name: 'Akwasi Asenso',
    phone,
    submittedLabel: 'Just now',
    firstName: 'Akwasi',
    lastName: 'Asenso',
    dob: '2001-03-12',
    gender: 'male',
    email: 'akwasi.asenso@example.com',
    address: 'Ayeduase Gate, Kumasi',
    idCardType: 'Ghana Card',
    idCardNumber: 'GHA-0011223344',
    nextOfKin:        { name: 'Comfort Asenso', relationship: 'Mother', phone: '024 887 1122' },
    emergencyContact: { name: 'Comfort Asenso', relationship: 'Mother', phone: '024 887 1122' },
  }
}
