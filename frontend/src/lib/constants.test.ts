import { describe, it, expect, afterEach } from 'vitest'
import { resolveRoleLink } from './constants'
import useAuthStore from '../features/auth/authStore'
import type { User } from '../features/auth/authService'
import type { Role } from './constants'

function signInAs(role: Role) {
  const user: User = { id: 'u-1', name: 'Test', role, email: 't@example.com', staffId: null }
  useAuthStore.setState({ user, token: 'tok' })
}

afterEach(() => {
  useAuthStore.setState({ user: null, token: null })
})

describe('resolveRoleLink', () => {
  it('prefixes a role-agnostic path with the signed-in manager base', () => {
    signInAs('manager')
    expect(resolveRoleLink('/records')).toBe('/manager/records')
  })

  it('prefixes a role-agnostic path with the signed-in secretary base', () => {
    signInAs('secretary')
    expect(resolveRoleLink('/records')).toBe('/secretary/records')
  })

  it('leaves an already-prefixed path unchanged', () => {
    signInAs('manager')
    expect(resolveRoleLink('/secretary/records')).toBe('/secretary/records')
    expect(resolveRoleLink('/manager/finances')).toBe('/manager/finances')
  })

  it('passes non-path links through untouched', () => {
    signInAs('manager')
    expect(resolveRoleLink('https://example.com')).toBe('https://example.com')
    expect(resolveRoleLink('#section')).toBe('#section')
  })
})
