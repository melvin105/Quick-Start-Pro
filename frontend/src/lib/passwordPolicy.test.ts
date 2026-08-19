import { describe, it, expect } from 'vitest'
import { passwordRequirements, isPasswordValid, MIN_PASSWORD_LENGTH } from './passwordPolicy'

// These assertions intentionally mirror backend/src/tests/passwordPolicy.test.ts.
// If one side changes, this test (or its backend twin) should fail — that's the
// signal to bring them back in sync.

describe('passwordPolicy (frontend mirror of the backend)', () => {
  it('enforces a 10-character minimum', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(10)
  })

  it('accepts a password meeting every requirement', () => {
    expect(isPasswordValid('Spintex2026road')).toBe(true)
    expect(passwordRequirements('Spintex2026road').every((r) => r.met)).toBe(true)
  })

  it('flags a too-short password', () => {
    const length = passwordRequirements('Ab1').find((r) => r.key === 'length')
    expect(length?.met).toBe(false)
    expect(isPasswordValid('Ab1')).toBe(false)
  })

  it('flags a password with no number', () => {
    const reqs = passwordRequirements('onlylettershere')
    expect(reqs.find((r) => r.key === 'number')?.met).toBe(false)
    expect(reqs.find((r) => r.key === 'letter')?.met).toBe(true)
  })

  it('flags a password with no letter', () => {
    expect(passwordRequirements('1234567890').find((r) => r.key === 'letter')?.met).toBe(false)
  })

  it('flags a common/guessable password even when the char rules pass', () => {
    const reqs = passwordRequirements('password123')
    expect(reqs.find((r) => r.key === 'length')?.met).toBe(true)
    expect(reqs.find((r) => r.key === 'letter')?.met).toBe(true)
    expect(reqs.find((r) => r.key === 'number')?.met).toBe(true)
    expect(reqs.find((r) => r.key === 'notCommon')?.met).toBe(false)
    expect(isPasswordValid('password123')).toBe(false)
  })

  it('matches the blocklist case-insensitively', () => {
    expect(passwordRequirements('QuickStartPro').find((r) => r.key === 'notCommon')?.met).toBe(false)
  })

  it('exposes exactly the four requirements in a stable order', () => {
    expect(passwordRequirements('').map((r) => r.key)).toEqual(['length', 'letter', 'number', 'notCommon'])
  })
})
