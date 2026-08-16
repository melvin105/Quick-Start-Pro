import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { ApiError, toApiError, CLIENT_ERROR_CODES } from './apiError'

function axiosWithResponse(status: number, data: unknown): AxiosError {
  const err = new AxiosError('Request failed')
  err.response = { status, data, statusText: '', headers: {}, config: {} as never }
  return err
}

describe('toApiError', () => {
  it('returns an existing ApiError unchanged', () => {
    const original = new ApiError('nope', 'X', 404)
    expect(toApiError(original)).toBe(original)
  })

  it('reads the backend error body (message + code + status)', () => {
    const err = toApiError(
      axiosWithResponse(403, { error: true, message: 'No access', code: 'FORBIDDEN' }),
    )
    expect(err).toBeInstanceOf(ApiError)
    expect(err.message).toBe('No access')
    expect(err.code).toBe('FORBIDDEN')
    expect(err.status).toBe(403)
    expect(err.isForbidden).toBe(true)
  })

  it('falls back to a default message when the body has no message', () => {
    const err = toApiError(axiosWithResponse(404, {}))
    expect(err.status).toBe(404)
    expect(err.isNotFound).toBe(true)
    expect(err.message).toMatch(/could not be found/i)
  })

  it('classifies a timeout (no response, ECONNABORTED)', () => {
    const timeout = new AxiosError('timeout')
    timeout.code = 'ECONNABORTED'
    const err = toApiError(timeout)
    expect(err.code).toBe(CLIENT_ERROR_CODES.TIMEOUT)
    expect(err.isNetworkError).toBe(true)
    expect(err.status).toBeUndefined()
  })

  it('classifies a network failure (no response at all)', () => {
    const err = toApiError(new AxiosError('Network Error'))
    expect(err.code).toBe(CLIENT_ERROR_CODES.NETWORK)
    expect(err.isNetworkError).toBe(true)
  })

  it('wraps a non-Axios throw as UNKNOWN', () => {
    const err = toApiError(new Error('boom'))
    expect(err.code).toBe(CLIENT_ERROR_CODES.UNKNOWN)
    expect(err.message).toBe('boom')
  })

  it('flags 5xx as a server error', () => {
    expect(toApiError(axiosWithResponse(503, {})).isServerError).toBe(true)
  })
})
