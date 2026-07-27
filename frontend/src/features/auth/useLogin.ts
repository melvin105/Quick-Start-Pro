import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from './authStore'
import type { User } from './authService'
import { ROLE_HOME, type Role } from '../../lib/constants'

interface LoginParams {
  role: Role
  password: string
}

// No backend auth endpoint yet — any password is accepted, only the
// selected role determines the mock user that gets signed in.
const MOCK_NAMES: Partial<Record<Role, string>> = {
  admin:     'John Mensah',
  secretary: 'Mercy Osei',
}

function buildMockUser(role: Role): User {
  const name = MOCK_NAMES[role] ?? role
  return {
    id:    `mock-${role}`,
    name,
    role,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@quickstartpro.local`,
  }
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleLogin = async ({ role }: LoginParams) => {
    setIsLoading(true)
    setError(null)

    await new Promise((resolve) => setTimeout(resolve, 350))

    const user = buildMockUser(role)
    setAuth(user, `mock-token-${role}`)
    setIsLoading(false)
    navigate(ROLE_HOME[user.role], { replace: true })
  }

  return { handleLogin, isLoading, error }
}
