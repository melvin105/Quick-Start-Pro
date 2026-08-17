import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'

// Mock the shared Axios client so the service is tested in isolation — no real
// HTTP, and the client's interceptors/env/auth-store imports never load.
vi.mock('../../lib/api', () => ({
  default: { get: vi.fn() },
}))

import api from '../../lib/api'
import { listPackages } from './packagesService'
import { ApiError } from '../../lib/apiError'

const mockedGet = vi.mocked(api.get)

describe('listPackages', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('reads GET /packages with no params by default', async () => {
    mockedGet.mockResolvedValue({ data: [] })

    await listPackages()

    expect(mockedGet).toHaveBeenCalledWith('/packages', { params: undefined })
  })

  it('passes activeOnly=true when requested', async () => {
    mockedGet.mockResolvedValue({ data: [] })

    await listPackages(true)

    expect(mockedGet).toHaveBeenCalledWith('/packages', { params: { activeOnly: 'true' } })
  })

  it('normalizes a server error into an ApiError', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 500,
      data: { error: true, message: 'Boom', code: 'BOOM' },
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as never,
    }
    mockedGet.mockRejectedValue(axiosError)

    await expect(listPackages()).rejects.toBeInstanceOf(ApiError)
  })
})
