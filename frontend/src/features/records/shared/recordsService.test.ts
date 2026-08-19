import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

import api from '../../../lib/api'
import { approveEndOfDay, createExpense, getDailyRecords, rejectEndOfDay, submitEndOfDay } from './recordsService'

const mockedGet = vi.mocked(api.get)
const mockedPost = vi.mocked(api.post)

describe('records service', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    mockedPost.mockReset()
  })

  it('reads the daily ledger for the selected date', async () => {
    const response = { date: '2026-08-17', ledger: [], closure: { status: 'open' } }
    mockedGet.mockResolvedValue({ data: response })

    await expect(getDailyRecords('2026-08-17')).resolves.toEqual(response)
    expect(mockedGet).toHaveBeenCalledWith('/records', { params: { date: '2026-08-17' } })
  })

  it('records an expense through the API', async () => {
    const created = { id: 'expense-1', category: 'fuel', amount: 250, expense_date: '2026-08-17' }
    mockedPost.mockResolvedValue({ data: created })

    await expect(createExpense({ category: 'fuel', amount: 250, description: 'Fuel', expenseDate: '2026-08-17' })).resolves.toEqual(created)
    expect(mockedPost).toHaveBeenCalledWith('/expenses', {
      category: 'fuel', amount: 250, description: 'Fuel', expenseDate: '2026-08-17',
    })
  })

  it('submits the selected day for manager approval', async () => {
    mockedPost.mockResolvedValue({ data: { status: 'pending_approval' } })

    await submitEndOfDay('2026-08-17')
    expect(mockedPost).toHaveBeenCalledWith('/end-of-day/submit', { date: '2026-08-17' })
  })

  it('approves and closes a submitted day through the API', async () => {
    mockedPost.mockResolvedValue({ data: { status: 'closed' } })

    await approveEndOfDay('2026-08-17')
    expect(mockedPost).toHaveBeenCalledWith('/end-of-day/approve', { date: '2026-08-17' })
  })

  it('returns a submitted day for correction with the manager note', async () => {
    mockedPost.mockResolvedValue({ data: { status: 'flagged' } })

    await rejectEndOfDay('2026-08-17', 'Check fuel expense')
    expect(mockedPost).toHaveBeenCalledWith('/end-of-day/reject', {
      date: '2026-08-17', note: 'Check fuel expense',
    })
  })
})
