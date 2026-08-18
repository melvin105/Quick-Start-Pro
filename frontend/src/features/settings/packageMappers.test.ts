import { describe, it, expect } from 'vitest'
import { toPackageOption } from './packageMappers'
import type { ApiPackage } from './packagesService'

const row: ApiPackage = {
  id: 'pkg-1', package_name: 'Driving + Licence', duration_weeks: 8, lesson_count: 15,
  total_fee: '3200', is_active: true,
}

describe('toPackageOption', () => {
  it('maps package_name -> name and coerces the string fee to a number', () => {
    expect(toPackageOption(row)).toEqual({ id: 'pkg-1', name: 'Driving + Licence', price: 3200 })
  })

  it('handles a numeric fee unchanged', () => {
    expect(toPackageOption({ ...row, total_fee: 1200 }).price).toBe(1200)
  })
})
