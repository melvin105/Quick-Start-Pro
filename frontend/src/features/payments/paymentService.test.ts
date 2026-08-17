import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError } from 'axios'

vi.mock('../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

import api from '../../lib/api'
import { ApiError } from '../../lib/apiError'
import { listPayments, recordPayment, type ListPaymentsResult } from './paymentService'

const mockedGet = vi.mocked(api.get)
const mockedPost = vi.mocked(api.post)

describe('payments service', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    mockedPost.mockReset()
  })

  it('reads the payments list with filters', async () => {
    const response: ListPaymentsResult = {
      payments: [],
      stats: { today_income: 0, month_income: 0, outstanding: 0, students_with_balance: 0 },
      total: 0,
      page: 1,
      limit: 100,
    }
    mockedGet.mockResolvedValue({ data: response })

    await expect(listPayments({ method: 'momo', dateFrom: '2026-08-01', limit: 100 })).resolves.toEqual(response)
    expect(mockedGet).toHaveBeenCalledWith('/payments', {
      params: { method: 'momo', dateFrom: '2026-08-01', limit: 100 },
    })
  })

  it('records a payment and returns the server-generated receipt', async () => {
    const created = {
      id: 'payment-1', student_id: 'student-1', amount: 200, method: 'cash' as const,
      payment_date: '2026-08-17', notes: null, created_at: '2026-08-17T09:00:00Z',
      receipt_id: 'receipt-1', receipt_no: 'R-0042', issued_at: '2026-08-17T09:00:00Z',
    }
    mockedPost.mockResolvedValue({ data: created })

    await expect(recordPayment({ studentId: 'student-1', amount: 200, method: 'cash' })).resolves.toEqual(created)
    expect(mockedPost).toHaveBeenCalledWith('/payments', {
      studentId: 'student-1', amount: 200, method: 'cash',
    })
  })

  it('surfaces backend overpayment rejection', async () => {
    const error = new AxiosError('Request failed')
    error.response = {
      status: 400,
      data: { error: true, message: 'Amount cannot exceed the outstanding balance of GHS 100.00.', code: 'EXCEEDS_BALANCE' },
      statusText: 'Bad Request', headers: {}, config: {} as never,
    }
    mockedPost.mockRejectedValue(error)

    const request = recordPayment({ studentId: 'student-1', amount: 200, method: 'cash' })
    await expect(request).rejects.toBeInstanceOf(ApiError)
    await expect(request).rejects.toMatchObject({
      code: 'EXCEEDS_BALANCE', status: 400,
    })
  })
})
