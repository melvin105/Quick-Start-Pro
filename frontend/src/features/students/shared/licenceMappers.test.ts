import { describe, it, expect } from 'vitest'
import { toLicenceProgress, toLicenceListItem } from './licenceMappers'
import type { ApiLicenceFields, ApiLicencePipelineRow } from './studentService'

const started: ApiLicenceFields = {
  eye_test_done:          true,
  eye_test_date:          '2026-01-10',
  learner_licence_issued: true,
  learner_licence_date:   '2026-02-01',
  exam_date:              '2026-09-20',
  exam_result:            'pending',
  licence_issued:         false,
  licence_issued_date:    null,
}

const notStarted: ApiLicenceFields = {
  eye_test_done:          null,
  eye_test_date:          null,
  learner_licence_issued: null,
  learner_licence_date:   null,
  exam_date:              null,
  exam_result:            null,
  licence_issued:         null,
  licence_issued_date:    null,
}

describe('toLicenceProgress', () => {
  it('maps the nested pipeline progress from the flat licence columns', () => {
    expect(toLicenceProgress(started)).toEqual({
      eyeTest:        { done: true, dateDone: '2026-01-10' },
      learnerLicence: { issued: true, dateIssued: '2026-02-01' },
      examDate:       { date: '2026-09-20' },
      fullLicence:    { issued: false, dateIssued: undefined },
    })
  })

  it('treats an all-null (not-started) row as an empty pipeline', () => {
    expect(toLicenceProgress(notStarted)).toEqual({
      eyeTest:        { done: false, dateDone: undefined },
      learnerLicence: { issued: false, dateIssued: undefined },
      examDate:       { date: undefined },
      fullLicence:    { issued: false, dateIssued: undefined },
    })
  })

  it('does not carry a venue or licence number (backend stores neither)', () => {
    const p = toLicenceProgress(started)
    expect('venue' in p.examDate).toBe(false)
    expect('licenceNo' in p.fullLicence).toBe(false)
  })
})

describe('toLicenceListItem', () => {
  const row: ApiLicencePipelineRow = {
    ...started,
    id:             'uuid-1',
    student_number: 'DP-2026-0001',
    student_name:   'John Mensah',
    enrolment_type: 'driving_and_licence',
  }

  it('keeps both ids and maps the enrolment enum to its display label', () => {
    const item = toLicenceListItem(row)
    expect(item).toMatchObject({
      id:            'uuid-1',
      studentNumber: 'DP-2026-0001',
      name:          'John Mensah',
      enrolment:     'Driving + Licence',
    })
    expect(item.progress.learnerLicence.issued).toBe(true)
  })

  it('maps a licence-only enrolment', () => {
    expect(toLicenceListItem({ ...row, enrolment_type: 'licence_only' }).enrolment).toBe('Licence Only')
  })
})
