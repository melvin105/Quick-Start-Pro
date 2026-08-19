export type EnrolmentType = 'Driving + Licence' | 'Licence Only' | 'Driving Only'
export type StudentStatus = 'active' | 'outstanding' | 'completed'
export type Gender = 'male' | 'female' | 'other'

export interface NextOfKin {
  name:         string
  relationship: string
  phone:        string
  email?:       string
}

export type IdCardType = 'Ghana Card' | 'Voter ID' | 'Passport' | "Driver's Licence" | 'Other'

export interface EmergencyContact {
  name:         string
  phone:        string
  relationship: string
}

// Sequential licence pipeline — each stage unlocks once the previous one is
// complete; Full Licence additionally waits for the exam date itself to pass.
export interface LicenceProgress {
  eyeTest:        { done: boolean; dateDone?: string }
  learnerLicence: { issued: boolean; dateIssued?: string }
  examDate:       { date?: string; venue?: string }
  fullLicence:    { issued: boolean; dateIssued?: string; licenceNo?: string }
}

export interface Student {
  id:               string
  studentNumber?:   string
  firstName:        string
  lastName:         string
  name:             string
  dob:              string
  gender:           Gender
  phone:            string
  email?:           string
  address?:         string
  photo?:           string
  idCardType?:      IdCardType
  idCardNumber?:    string
  nextOfKin:        NextOfKin
  emergencyContact: EmergencyContact
  enrolment:        EnrolmentType
  programme?:       string
  notes?:           string
  balance:          number
  status:           StudentStatus
  registrationDate?:   string
  packageFee?:         number
  lessonsPackageTotal?: number
  lessonsTaken?:        number
  licenceProgress?:     LicenceProgress
}

// A student-submitted QR self-registration awaiting the secretary's
// Enrolment step (Step 4) before it becomes a full Student record.
export interface PendingSubmission {
  id:               string
  name:             string
  phone:            string
  submittedLabel:   string
  firstName:        string
  lastName:         string
  dob:              string
  gender:           Gender
  email?:           string
  address?:         string
  photo?:           string
  idCardType?:      IdCardType
  idCardNumber?:    string
  nextOfKin:        NextOfKin
  emergencyContact: EmergencyContact
}
