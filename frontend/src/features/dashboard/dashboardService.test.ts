import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AxiosError } from 'axios'

// Mock the shared Axios client so the service is tested in isolation — no real
// HTTP, and the client's interceptors/env/auth-store imports never load.
vi.mock('../../lib/api', () => ({
  default: { get: vi.fn() },
}))

import api from '../../lib/api'
import { getDashboard, type Dashboard } from './dashboardService'
import { ApiError } from '../../lib/apiError'

const mockedGet = vi.mocked(api.get)

const sampleDashboard: Dashboard = {
  role: 'secretary',
  stats: {
    total_students: 284,
    active_students: 250,
    outstanding_balances: 12450,
    lessons_completed: 40,
    licences_issued: 12,
    upcoming_lessons: 18,
    payments_recorded_today: 5,
    payments_recorded_today_total: 2500,
    students_with_balance: 30,
    licences_in_progress: 8,
  },
  todaysAttendance: [],
}

describe('getDashboard', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('reads GET /dashboard and returns the payload', async () => {
    mockedGet.mockResolvedValue({ data: sampleDashboard })

    const result = await getDashboard()

    expect(mockedGet).toHaveBeenCalledWith('/dashboard')
    expect(result).toEqual(sampleDashboard)
  })

  it('normalizes a server error into an ApiError carrying the backend message/status', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 500,
      data: { error: true, message: 'Server exploded', code: 'BOOM' },
      statusText: 'Internal Server Error',
      headers: {},
      config: {} as never,
    }
    mockedGet.mockRejectedValue(axiosError)

    await expect(getDashboard()).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Server exploded',
      code: 'BOOM',
      status: 500,
    })
    await expect(getDashboard()).rejects.toBeInstanceOf(ApiError)
  })
})
