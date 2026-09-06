import { describe, expect, it } from 'vitest'
import { getTodayColumn, getTodayLabel } from './utils'

describe('schedule day helpers', () => {
  it('shows Sunday without highlighting an unrelated schedule column', () => {
    const sundayInAccra = new Date('2026-09-06T12:00:00Z')

    expect(getTodayLabel(sundayInAccra)).toBe('Sunday')
    expect(getTodayColumn(sundayInAccra)).toBeNull()
  })

  it('uses the Accra calendar day instead of the device offset', () => {
    const mondayInAccra = new Date('2026-09-06T23:30:00-02:00')

    expect(getTodayLabel(mondayInAccra)).toBe('Monday')
    expect(getTodayColumn(mondayInAccra)).toBe('MON')
  })
})
