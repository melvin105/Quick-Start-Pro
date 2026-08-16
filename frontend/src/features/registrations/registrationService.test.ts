import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'

// Mock the shared Axios client so the service is tested in isolation — no real
// HTTP, and the client's interceptors/env/auth-store imports never load.
vi.mock('../../lib/api', () => ({
  default: { get: vi.fn() },
}))

import api from '../../lib/api'
import { getPendingRegistrations, type Registration } from './registrationService'
import { ApiError } from '../../lib/apiError'

const mockedGet = vi.mocked(api.get)

const sampleRegistration: Registration = {
  id:           'reg-1',
  first_name:   'Kofi',
  last_name:    'Mensah',
  phone:        '0240000000',
  email:        null,
  status:       'pending',
  student_id:   null,
  submitted_at: '2026-08-16T09:30:00Z',
  created_at:   '2026-08-16T09:30:00Z',
}

describe('getPendingRegistrations', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('reads GET /registrations filtered to the pending queue', async () => {
    mockedGet.mockResolvedValue({ data: [sampleRegistration] })

    const result = await getPendingRegistrations()

    expect(mockedGet).toHaveBeenCalledWith('/registrations', { params: { status: 'pending' } })
    expect(result).toEqual([sampleRegistration])
  })

  it('normalizes a server error into an ApiError carrying the backend message/status', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 403,
      data: { error: true, message: 'No access', code: 'FORBIDDEN' },
      statusText: 'Forbidden',
      headers: {},
      config: {} as never,
    }
    mockedGet.mockRejectedValue(axiosError)

    await expect(getPendingRegistrations()).rejects.toBeInstanceOf(ApiError)
    await expect(getPendingRegistrations()).rejects.toMatchObject({
      message: 'No access',
      code: 'FORBIDDEN',
      status: 403,
    })
  })
})
