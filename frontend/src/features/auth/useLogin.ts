import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import useAuthStore from './authStore'
import * as authService from './authService'
import { ROLE_HOME, type Role } from '../../lib/constants'

interface LoginParams {
  role: Role
  password: string
}

// Shape of the backend's error body (see backend ApiError handler in index.ts):
// { error: true, message, code }. We only surface a friendly message; the code
// is available if a caller ever needs to branch on it.
interface ApiErrorBody {
  message?: string
  code?: string
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
      const { token, user } = await authService.login({ role, password })
      setAuth(user, token)
      navigate(ROLE_HOME[user.role], { replace: true })
    } catch (err) {
      // Invalid credentials come back as 401 INVALID_CREDENTIALS; anything else
      // is a network/server problem. Keep the credentials message generic so we
      // never reveal which part (role vs password) was wrong.
      const axiosErr = err as AxiosError<ApiErrorBody>
      if (axiosErr.response?.status === 401) {
        setError('Invalid role or password.')
      } else if (axiosErr.response) {
        setError(axiosErr.response.data?.message ?? 'Something went wrong. Please try again.')
      } else {
        setError('Cannot reach the server. Check your connection and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading, error }
}
