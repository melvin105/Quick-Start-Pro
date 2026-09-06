import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'

// Mock the shared Axios client so the service is tested in isolation — no real
// HTTP, and the client's interceptors/env/auth-store imports never load.
vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}))

import api from '../../../lib/api'
import { listStudents, updateStudent, createStudent, getStudent, listLicences, updateLicence, type StudentListResult } from './studentService'
import { ApiError } from '../../../lib/apiError'

const mockedGet = vi.mocked(api.get)
const mockedPatch = vi.mocked(api.patch)
const mockedPost = vi.mocked(api.post)

const emptyResult: StudentListResult = { students: [], total: 0, page: 1, limit: 100 }

describe('listStudents', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('reads GET /students, forwarding the filter params', async () => {
    mockedGet.mockResolvedValue({ data: emptyResult })

    const result = await listStudents({ search: 'john', outstandingOnly: true, page: 2, limit: 20 })

    expect(mockedGet).toHaveBeenCalledWith('/students', {
      params: { search: 'john', outstandingOnly: true, page: 2, limit: 20 },
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

describe('getStudent', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('reads GET /students/:id and returns the profile row', async () => {
    const profile = { id: 'uuid-1', student_number: 'DP-2026-0001', first_name: 'John' }
    mockedGet.mockResolvedValue({ data: profile })

    const result = await getStudent('uuid-1')

    expect(mockedGet).toHaveBeenCalledWith('/students/uuid-1')
    expect(result).toEqual(profile)
  })

  it('normalizes a not-found error into an ApiError', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 404,
      data: { error: true, message: 'Student not found.', code: 'NOT_FOUND' },
      statusText: 'Not Found',
      headers: {},
      config: {} as never,
    }
    mockedGet.mockRejectedValue(axiosError)

    await expect(getStudent('missing')).rejects.toMatchObject({ name: 'ApiError', code: 'NOT_FOUND' })
  })
})

describe('listLicences', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('reads GET /students/licences and returns the pipeline rows', async () => {
    const rows = [{ id: 'uuid-1', student_number: 'DP-2026-0001', student_name: 'John' }]
    mockedGet.mockResolvedValue({ data: rows })

    const result = await listLicences()

    expect(mockedGet).toHaveBeenCalledWith('/students/licences')
    expect(result).toEqual(rows)
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

    await expect(listLicences()).rejects.toBeInstanceOf(ApiError)
  })
})

describe('updateLicence', () => {
  beforeEach(() => {
    mockedPatch.mockReset()
  })

  it('PATCHes /students/:id/licence with the camelCase patch and returns the row', async () => {
    const updated = { eye_test_done: true, eye_test_date: '2026-01-10' }
    mockedPatch.mockResolvedValue({ data: updated })

    const result = await updateLicence('uuid-1', { eyeTestDone: true, eyeTestDate: '2026-01-10' })

    expect(mockedPatch).toHaveBeenCalledWith('/students/uuid-1/licence', { eyeTestDone: true, eyeTestDate: '2026-01-10' })
    expect(result).toEqual(updated)
  })

  it('normalizes a validation error into an ApiError', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 400,
      data: { error: true, message: 'No updatable licence fields provided.', code: 'INVALID_INPUT' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
    }
    mockedPatch.mockRejectedValue(axiosError)

    await expect(updateLicence('uuid-1', {})).rejects.toMatchObject({ name: 'ApiError', code: 'INVALID_INPUT' })
  })
})

describe('createStudent', () => {
  beforeEach(() => {
    mockedPost.mockReset()
  })

  const input = {
    firstName: 'Kofi', lastName: 'Mensah', gender: 'male', dob: '2001-03-12',
    phone: '0240000000', enrolmentType: 'driving_and_licence' as const, packageId: 'pkg-1',
  }

  it('POSTs /students and returns the created id + student number', async () => {
    const created = { id: 'uuid-9', student_number: 'DP-2026-0009' }
    mockedPost.mockResolvedValue({ data: created })

    const result = await createStudent(input)

    expect(mockedPost).toHaveBeenCalledWith('/students', input)
    expect(result).toEqual(created)
  })

  it('surfaces the backend 409 as an ApiError with code POSSIBLE_DUPLICATE', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 409,
      data: { error: true, message: 'A student with a matching name or phone number already exists.', code: 'POSSIBLE_DUPLICATE' },
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
    }
    mockedPost.mockRejectedValue(axiosError)

    await expect(createStudent(input)).rejects.toMatchObject({
      name: 'ApiError',
      code: 'POSSIBLE_DUPLICATE',
      status: 409,
    })
  })

  it('forwards confirmDifferentPerson when resubmitting past the duplicate guard', async () => {
    mockedPost.mockResolvedValue({ data: { id: 'uuid-9', student_number: 'DP-2026-0009' } })

    await createStudent({ ...input, confirmDifferentPerson: true })

    expect(mockedPost).toHaveBeenCalledWith('/students', { ...input, confirmDifferentPerson: true })
  })
})
