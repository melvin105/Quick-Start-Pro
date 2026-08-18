import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'

// Mock the shared Axios client so the service is tested in isolation — no real
// HTTP, and the client's interceptors/env/auth-store imports never load.
vi.mock('../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

import api from '../../lib/api'
import { createPackage, listPackages, updatePackage } from './packagesService'
import { ApiError } from '../../lib/apiError'

const mockedGet = vi.mocked(api.get)
const mockedPost = vi.mocked(api.post)
const mockedPatch = vi.mocked(api.patch)

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

describe('package mutations', () => {
  beforeEach(() => {
    mockedPost.mockReset()
    mockedPatch.mockReset()
  })

  it('creates a package through the manager API', async () => {
    const input = { packageName: 'Driving Only', totalFee: 2000, lessonCount: 15 }
    mockedPost.mockResolvedValue({ data: { id: 'pkg-1' } })
    await createPackage(input)
    expect(mockedPost).toHaveBeenCalledWith('/packages', input)
  })

  it('updates a package through the manager API', async () => {
    mockedPatch.mockResolvedValue({ data: { id: 'pkg-1' } })
    await updatePackage('pkg-1', { totalFee: 2200 })
    expect(mockedPatch).toHaveBeenCalledWith('/packages/pkg-1', { totalFee: 2200 })
  })
})
