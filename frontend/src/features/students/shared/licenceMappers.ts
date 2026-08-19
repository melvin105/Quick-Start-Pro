import type { ApiLicenceFields, ApiLicencePipelineRow } from './studentService'
import { enrolmentLabel } from './studentMappers'
import type { LicenceProgress, EnrolmentType } from './types'

// Map the flat, nullable licence columns (from the profile view or the PATCH
// response) into the nested LicenceProgress the UI pipeline is built from.
// venue (examDate) and licenceNo (fullLicence) are intentionally omitted: the
// backend doesn't store them, so they'd always be undefined here anyway.
export function toLicenceProgress(fields: ApiLicenceFields): LicenceProgress {
  return {
    eyeTest: {
      done:     Boolean(fields.eye_test_done),
      dateDone: fields.eye_test_date ?? undefined,
    },
    learnerLicence: {
      issued:     Boolean(fields.learner_licence_issued),
      dateIssued: fields.learner_licence_date ?? undefined,
    },
    examDate: {
      date: fields.exam_date ?? undefined,
    },
    fullLicence: {
      issued:     Boolean(fields.licence_issued),
      dateIssued: fields.licence_issued_date ?? undefined,
    },
  }
}

// A row of the Students → Licences table. Keeps both ids: `id` (uuid) drives the
// profile/update links, `studentNumber` is the human-facing "Student No.".
export interface LicenceListItem {
  id:            string
  studentNumber: string
  name:          string
  enrolment:     EnrolmentType
  progress:      LicenceProgress
}

export function toLicenceListItem(row: ApiLicencePipelineRow): LicenceListItem {
  return {
    id:            row.id,
    studentNumber: row.student_number,
    name:          row.student_name,
    enrolment:     enrolmentLabel(row.enrolment_type) as EnrolmentType,
    progress:      toLicenceProgress(row),
  }
}
