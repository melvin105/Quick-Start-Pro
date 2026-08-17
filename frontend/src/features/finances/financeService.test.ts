import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/api', () => ({ default: { get: vi.fn() } }))

import api from '../../lib/api'
import { getDriverReport, getFinances } from './financeService'

const mockedGet = vi.mocked(api.get)

describe('finance and report service', () => {
  beforeEach(() => mockedGet.mockReset())

  it('reads the manager finance period from the API', async () => {
    const response = { from: '2026-08-01', to: '2026-08-31', income: 500, expenses: 100 }
    mockedGet.mockResolvedValue({ data: response })

    await expect(getFinances('2026-08-01', '2026-08-31')).resolves.toEqual(response)
    expect(mockedGet).toHaveBeenCalledWith('/finances', {
      params: { from: '2026-08-01', to: '2026-08-31' },
    })
  })

  it('reads a filtered driver report from the API', async () => {
    mockedGet.mockResolvedValue({ data: { instructors: [] } })

    await getDriverReport('2026-08-01', '2026-08-31', 'instructor-1')
    expect(mockedGet).toHaveBeenCalledWith('/reports/driver', {
      params: { from: '2026-08-01', to: '2026-08-31', instructorId: 'instructor-1' },
    })
  })
})
