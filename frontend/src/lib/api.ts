import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import useAuthStore from '../features/auth/authStore'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Silent refresh ──────────────────────────────────────────────────────────
// The access token is short-lived (~15m). When it expires, a request comes back
// 401; instead of bouncing the user to /login, we transparently exchange the
// refresh token for a new pair and retry the original request once. Only if the
// refresh itself fails (refresh token expired/revoked) do we hard-log-out.

// Extends Axios' config with a private flag so a retried request can't loop.
interface RetriableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Single-flight guard: many requests can 401 at once (e.g. a dashboard firing
// several calls in parallel). They all await THIS one promise so we rotate the
// refresh token exactly once — rotation is single-use, so concurrent refreshes
// would invalidate each other and log the user out.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState()
  if (!refreshToken) return null
  try {
    // A bare axios call (not `api`) so this can't recurse through the response
    // interceptor or pick up the stale Authorization header.
    const { data } = await axios.post<{ token: string; refreshToken: string }>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10_000 },
    )
    useAuthStore.getState().setTokens(data.token, data.refreshToken)
    return data.token
  } catch {
    return null
  }
}

function forceLogout() {
  useAuthStore.getState().logout()
  window.location.href = '/login'
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined
    const url = original?.url ?? ''
    // /auth/login and /auth/refresh return 401 as a normal outcome (bad
    // credentials / dead session) — never try to silently refresh those.
    const isAuthEndpoint = url.endsWith('/auth/login') || url.endsWith('/auth/refresh')

    if (error.response?.status !== 401 || isAuthEndpoint || !original || original._retry) {
      return Promise.reject(error)
    }

    original._retry = true
    refreshPromise = refreshPromise ?? refreshAccessToken().finally(() => { refreshPromise = null })
    const newToken = await refreshPromise

    if (!newToken) {
      forceLogout()
      return Promise.reject(error)
    }

    original.headers.Authorization = `Bearer ${newToken}`
    return api(original)
  },
)

export default api
