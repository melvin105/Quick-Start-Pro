import type { LicenceProgress } from './types'
import { formatDate } from './utils'

export type LicenceStepKey = 'eyeTest' | 'learnerLicence' | 'examDate' | 'fullLicence'
export type LicenceStepStatus = 'done' | 'active' | 'locked'

export interface LicenceStepView {
  key:          LicenceStepKey
  label:        string
  status:       LicenceStepStatus
  detail?:      string
  lockedReason?: string
}

export const DEFAULT_LICENCE_PROGRESS: LicenceProgress = {
  eyeTest:        { done: false },
  learnerLicence: { issued: false },
  examDate:       {},
  fullLicence:    { issued: false },
}

export function buildLicenceSteps(progress: LicenceProgress): LicenceStepView[] {
  const eyeTestDone = progress.eyeTest.done
  const learnerDone = progress.learnerLicence.issued
  const examDateSet = Boolean(progress.examDate.date)
  const examDatePassed = examDateSet ? new Date(progress.examDate.date!) <= new Date() : false
  const fullLicenceIssued = progress.fullLicence.issued

  const steps: LicenceStepView[] = []

  steps.push({
    key: 'eyeTest',
    label: 'Eye Test',
    status: eyeTestDone ? 'done' : 'active',
    detail: eyeTestDone && progress.eyeTest.dateDone ? `Done ${formatDate(progress.eyeTest.dateDone)}` : undefined,
  })

  steps.push({
    key: 'learnerLicence',
    label: 'Learner Licence',
    status: !eyeTestDone ? 'locked' : learnerDone ? 'done' : 'active',
    detail: learnerDone && progress.learnerLicence.dateIssued
      ? `Issued ${formatDate(progress.learnerLicence.dateIssued)}`
      : undefined,
    lockedReason: !eyeTestDone ? 'Complete Eye Test first' : undefined,
  })

  steps.push({
    key: 'examDate',
    label: 'Exam Date',
    status: !learnerDone ? 'locked' : examDateSet ? 'done' : 'active',
    detail: examDateSet
      ? `${formatDate(progress.examDate.date!)}${progress.examDate.venue ? ` — ${progress.examDate.venue}` : ''}`
      : undefined,
    lockedReason: !learnerDone ? 'Complete Learner Licence first' : undefined,
  })

  steps.push({
    key: 'fullLicence',
    label: 'Full Licence',
    status: !(examDateSet && examDatePassed) ? 'locked' : fullLicenceIssued ? 'done' : 'active',
    detail: fullLicenceIssued && progress.fullLicence.dateIssued
      ? `Issued ${formatDate(progress.fullLicence.dateIssued)}`
      : undefined,
    lockedReason: !examDateSet
      ? 'Schedule an exam date first'
      : !examDatePassed
        ? `Unlocks after ${formatDate(progress.examDate.date!)}`
        : undefined,
  })

  return steps
}
