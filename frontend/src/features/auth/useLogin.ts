import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useAuthStore from '../../store/authStore'
import { login as loginApi, type LoginCredentials } from '../../services/authService'
import { ROLE_HOME } from '../../lib/constants'

interface LoginParams extends LoginCredentials {
  remember?: boolean
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined
    return data?.message ?? err.message ?? 'Sign in failed. Please try again.'
  }
  return 'Sign in failed. Please try again.'
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleLogin = async ({ role, password }: LoginParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const { user, token } = await loginApi({ role, password })
      setAuth(user, token)
      navigate(ROLE_HOME[user.role], { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading, error }
}
