import { AxiosError } from 'axios'

// Every backend failure returns this JSON body (see docs/API-Schema.md):
//   { "error": true, "message": string, "code": string }
// with an appropriate HTTP status. `toApiError` below turns any thrown value —
// an Axios error carrying that body, a network/timeout failure with no
// response, or an unexpected non-Axios throw — into a single normalized shape
// the UI can branch on, so no screen has to poke at Axios internals.
interface ApiErrorBody {
  error:   boolean
  message: string
  code:    string
}

// Codes we synthesize for failures that never reached the server (so there is
// no backend body to read). Backend-supplied codes pass through untouched.
export const CLIENT_ERROR_CODES = {
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN_ERROR',
} as const

export class ApiError extends Error {
  // Machine-readable code — either the backend's `code` or one of
  // CLIENT_ERROR_CODES for failures that never got a response.
  readonly code: string
  // HTTP status, or undefined when the request never reached the server.
  readonly status: number | undefined

  constructor(message: string, code: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }

  // Convenience predicates so screens can render the right empty/error state
  // (see the shared acceptance criteria on the Phase 2 migration issues).
  get isUnauthorized() { return this.status === 401 }
  get isForbidden()    { return this.status === 403 }
  get isNotFound()     { return this.status === 404 }
  get isValidation()   { return this.status === 400 || this.status === 422 }
  get isServerError()  { return this.status !== undefined && this.status >= 500 }
  // No response at all — offline, DNS failure, CORS, or a timeout.
  get isNetworkError() {
    return this.status === undefined
  }
}

function hasApiErrorBody(data: unknown): data is ApiErrorBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as Record<string, unknown>).message === 'string'
  )
}

// Normalize any caught value into an ApiError. Services `throw toApiError(err)`
// so their callers only ever handle this one type.
export function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err

  if (err instanceof AxiosError) {
    const { response, code } = err

    // The request reached the server and it answered with an error status.
    if (response) {
      const body = response.data
      const message = hasApiErrorBody(body) ? body.message : defaultMessageFor(response.status)
      const errorCode = hasApiErrorBody(body) ? body.code : `HTTP_${response.status}`
      return new ApiError(message, errorCode, response.status)
    }

    // No response — distinguish a timeout from a generic network failure so the
    // UI can tell the user to retry vs. check their connection.
    if (code === 'ECONNABORTED') {
      return new ApiError('The request timed out. Please try again.', CLIENT_ERROR_CODES.TIMEOUT)
    }
    return new ApiError(
      'Could not reach the server. Check your connection and try again.',
      CLIENT_ERROR_CODES.NETWORK,
    )
  }

  // Something non-Axios was thrown (a bug, a rejected non-HTTP promise, etc.).
  const message = err instanceof Error ? err.message : 'Something went wrong.'
  return new ApiError(message, CLIENT_ERROR_CODES.UNKNOWN)
}

function defaultMessageFor(status: number): string {
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return "You don't have permission to do that."
  if (status === 404) return 'That item could not be found.'
  if (status >= 500) return 'The server ran into a problem. Please try again.'
  return 'The request could not be completed.'
}
