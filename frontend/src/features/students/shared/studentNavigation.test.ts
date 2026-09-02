import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/constants', () => ({
  ROUTES: {
    STUDENTS:        '/secretary/students',
    STUDENT_PROFILE: '/secretary/students/:id',
    STUDENT_EDIT:    '/secretary/students/:id/edit',
    STUDENT_LICENCE: '/secretary/students/:id/licence',
  },
}))

import { studentListPath, studentProfilePath, studentProfileReturnPath } from './utils'

describe('student list return navigation', () => {
  it('serializes the selected list tab, filters, search, and page', () => {
    expect(studentListPath({
      tab: 'active',
      search: 'Ama',
      enrolment: 'Driving Only',
      status: 'outstanding',
      page: 3,
    })).toBe('/secretary/students?search=Ama&enrolment=Driving+Only&status=outstanding&page=3')
  })

  it('carries the filtered list URL through the profile route', () => {
    const returnTo = studentListPath({ enrolment: 'Driving Only' })
    const profilePath = studentProfilePath('student-1', returnTo)
    const profileParams = new URLSearchParams(profilePath.split('?')[1])

    expect(studentProfileReturnPath(profileParams)).toBe('/secretary/students?enrolment=Driving+Only')
  })

  it('rejects a return URL outside the current students route', () => {
    expect(studentProfileReturnPath(new URLSearchParams({ from: 'https://example.com' })))
      .toBe('/secretary/students')
  })
})
