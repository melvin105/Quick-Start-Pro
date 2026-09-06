import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError } from 'axios'

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

import api from '../../../lib/api'
import { ApiError } from '../../../lib/apiError'
import { removeSlotFromDays } from './schedulingService'

const mockedPost = vi.mocked(api.post)

describe('removeSlotFromDays', () => {
  beforeEach(() => {
    mockedPost.mockReset()
  })

  it('posts the student and selected weekdays to the batch removal endpoint', async () => {
    const response = { removedDays: [1, 3, 5], startHour: 9 }
    mockedPost.mockResolvedValue({ data: response })

    await expect(removeSlotFromDays('slot-1', 'student-1', [1, 3, 5])).resolves.toEqual(response)
    expect(mockedPost).toHaveBeenCalledWith(
      '/scheduling/slots/slot-1/remove-days',
      { studentId: 'student-1', days: [1, 3, 5] },
    )
  })

  it('normalizes backend errors for the profile UI', async () => {
    const axiosError = new AxiosError('Request failed')
    axiosError.response = {
      status: 404,
      data: { error: true, message: 'Source assignment not found.', code: 'NOT_FOUND' },
      statusText: 'Not Found',
      headers: {},
      config: {} as never,
    }
    mockedPost.mockRejectedValue(axiosError)

    await expect(removeSlotFromDays('slot-1', 'student-1', [1])).rejects.toBeInstanceOf(ApiError)
  })
})
