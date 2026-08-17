import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'

// Mock the shared Axios client so the service is tested in isolation — no real
// HTTP, and the client's interceptors/env/auth-store imports never load.
vi.mock('../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

import api from '../../lib/api'
import {
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  type Registration,
} from './registrationService'
import { ApiError } from '../../lib/apiError'

const mockedGet = vi.mocked(api.get)
const mockedPost = vi.mocked(api.post)

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

describe('approveRegistration', () => {
  beforeEach(() => {
    mockedPost.mockReset()
  })

  it('POSTs the enrolment decision and returns the created student', async () => {
    const student = { id: 'stu-1', student_number: 'DP-2026-0001' }
    mockedPost.mockResolvedValue({ data: student })

    const result = await approveRegistration('reg-1', { enrolmentType: 'driving_and_licence' })

    expect(mockedPost).toHaveBeenCalledWith('/registrations/reg-1/approve', {
      enrolmentType: 'driving_and_licence',
    })
    expect(result).toEqual(student)
  })

  it('forwards confirmDifferentPerson when retrying past the duplicate guard', async () => {
    mockedPost.mockResolvedValue({ data: { id: 'stu-2', student_number: 'DP-2026-0002' } })

    await approveRegistration('reg-2', { enrolmentType: 'driving_only', confirmDifferentPerson: true })

    expect(mockedPost).toHaveBeenCalledWith('/registrations/reg-2/approve', {
      enrolmentType: 'driving_only',
      confirmDifferentPerson: true,
    })
  })

  it('surfaces the POSSIBLE_DUPLICATE conflict as an ApiError the modal can branch on', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 409,
      data: { error: true, message: 'A student with a matching name or phone number already exists.', code: 'POSSIBLE_DUPLICATE' },
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
    }
    mockedPost.mockRejectedValue(axiosError)

    await expect(
      approveRegistration('reg-1', { enrolmentType: 'driving_and_licence' }),
    ).rejects.toMatchObject({ name: 'ApiError', code: 'POSSIBLE_DUPLICATE', status: 409 })
  })
})

describe('rejectRegistration', () => {
  beforeEach(() => {
    mockedPost.mockReset()
  })

  it('POSTs the reason and returns the updated registration', async () => {
    const rejected: Registration = { ...sampleRegistration, status: 'rejected' }
    mockedPost.mockResolvedValue({ data: rejected })

    const result = await rejectRegistration('reg-1', 'Duplicate submission')

    expect(mockedPost).toHaveBeenCalledWith('/registrations/reg-1/reject', { reason: 'Duplicate submission' })
    expect(result).toEqual(rejected)
  })

  it('normalizes a validation error (empty reason) into an ApiError', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 400,
      data: { error: true, message: 'A rejection reason is required.', code: 'INVALID_INPUT' },
      statusText: 'Bad Request',
      headers: {},
      config: {} as never,
    }
    mockedPost.mockRejectedValue(axiosError)

    await expect(rejectRegistration('reg-1', '')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'INVALID_INPUT',
      status: 400,
    })
  })
})
