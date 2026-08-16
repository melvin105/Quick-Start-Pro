import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'

// Mock the shared Axios client so the service is tested in isolation — no real
// HTTP, and the client's interceptors/env/auth-store imports never load.
vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}))

import api from '../../../lib/api'
import { listStudents, updateStudent, type StudentListResult } from './studentService'
import { ApiError } from '../../../lib/apiError'

const mockedGet = vi.mocked(api.get)
const mockedPatch = vi.mocked(api.patch)

const emptyResult: StudentListResult = { students: [], total: 0, page: 1, limit: 100 }

describe('listStudents', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('reads GET /students, forwarding the filter params', async () => {
    mockedGet.mockResolvedValue({ data: emptyResult })

    const result = await listStudents({ search: 'john', status: 'active', limit: 100 })

    expect(mockedGet).toHaveBeenCalledWith('/students', {
      params: { search: 'john', status: 'active', limit: 100 },
    })
    expect(result).toEqual(emptyResult)
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

    await expect(listStudents()).rejects.toBeInstanceOf(ApiError)
  })
})

describe('updateStudent', () => {
  beforeEach(() => {
    mockedPatch.mockReset()
  })

  it('PATCHes /students/:id with the camelCase patch and returns the row', async () => {
    const updated = { id: 'uuid-1', status: 'archived' }
    mockedPatch.mockResolvedValue({ data: updated })

    const result = await updateStudent('uuid-1', { status: 'archived' })

    expect(mockedPatch).toHaveBeenCalledWith('/students/uuid-1', { status: 'archived' })
    expect(result).toEqual(updated)
  })

  it('normalizes a validation error into an ApiError carrying the backend message', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 400,
      data: { error: true, message: 'No updatable fields provided.', code: 'INVALID_INPUT' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
    }
    mockedPatch.mockRejectedValue(axiosError)

    await expect(updateStudent('uuid-1', {})).rejects.toMatchObject({
      name: 'ApiError',
      code: 'INVALID_INPUT',
      status: 400,
    })
  })
})
