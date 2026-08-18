import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

import api from '../../../lib/api'
import { createDailyCheckinToken, lookupCheckin, submitSelfCheckin } from './checkinService'

const mockedPost = vi.mocked(api.post)

describe('public check-in service', () => {
  beforeEach(() => mockedPost.mockReset())

  it('requests a staff-authenticated daily QR token', async () => {
    mockedPost.mockResolvedValue({ data: { token: 'daily-token', date: '2026-08-17' } })
    await createDailyCheckinToken()
    expect(mockedPost).toHaveBeenCalledWith('/checkin/token')
  })

  it('looks up a student using the scanned token', async () => {
    mockedPost.mockResolvedValue({ data: { status: 'not_found' } })
    await lookupCheckin('0240000000', 'daily-token')
    expect(mockedPost).toHaveBeenCalledWith('/checkin/lookup', { phone: '0240000000', token: 'daily-token' })
  })

  it('persists self check-in with the selected instructor', async () => {
    mockedPost.mockResolvedValue({ data: { studentName: 'Kofi Mensah', alreadyCheckedIn: false } })
    await submitSelfCheckin('0240000000', 'daily-token', 'instructor-1')
    expect(mockedPost).toHaveBeenCalledWith('/checkin', {
      phone: '0240000000', token: 'daily-token', instructorId: 'instructor-1',
    })
  })
})
