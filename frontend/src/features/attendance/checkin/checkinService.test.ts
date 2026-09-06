import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

import api from '../../../lib/api'
import { lookupCheckin, submitSelfCheckin } from './checkinService'

const mockedPost = vi.mocked(api.post)

describe('public check-in service', () => {
  beforeEach(() => mockedPost.mockReset())

  it('looks up a student by phone', async () => {
    mockedPost.mockResolvedValue({ data: { status: 'not_found' } })
    await lookupCheckin('0240000000')
    expect(mockedPost).toHaveBeenCalledWith('/checkin/lookup', { phone: '0240000000' })
  })

  it('persists self check-in with the selected instructor', async () => {
    mockedPost.mockResolvedValue({ data: { studentName: 'Kofi Mensah', alreadyCheckedIn: false } })
    await submitSelfCheckin('0240000000', 'instructor-1')
    expect(mockedPost).toHaveBeenCalledWith('/checkin', {
      phone: '0240000000', instructorId: 'instructor-1',
    })
  })
})
