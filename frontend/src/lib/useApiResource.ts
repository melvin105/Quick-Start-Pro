import { useCallback, useEffect, useRef, useState } from 'react'
import { toApiError, type ApiError } from './apiError'
import useAuthStore from '../features/auth/authStore'

// A minimal read-side data hook for the service layer. The app doesn't use a
// query library (react-query et al.) — data-fetching is plain Axios services +
// zustand — so this gives every screen the same { data, loading, error,
// refetch } contract without each one hand-rolling loading/error state.
//
// It is deliberately read-only: mutations (create/update/approve/mark/pay) stay
// as direct `await service.doThing()` calls in the component/store so the caller
// can await the result, show a toast, and refetch. Use this for the initial
// load of a page's primary data.
export interface ApiResource<T> {
  data:    T | null
  loading: boolean
  error:   ApiError | null
  // Re-run the fetcher (e.g. a "Retry" button, or after a mutation). Resolves
  // when the refetch settles; never rejects — the error lands in `error`.
  refetch: () => Promise<void>
}

export interface ApiResourceOptions {
  // Delay a request until its data is actually needed (for example, an
  // inactive tab or a closed modal).
  enabled?: boolean
  // Opt-in cache identity. Entries are scoped to the signed-in user so one
  // account can never receive another account's cached response.
  cacheKey?: string
  // How long a cached response can satisfy a mount without a network request.
  staleTime?: number
}

interface CacheEntry {
  data?: unknown
  updatedAt: number
  promise?: Promise<unknown>
}

const resourceCache = new Map<string, CacheEntry>()

function scopedCacheKey(cacheKey?: string) {
  if (!cacheKey) return null
  const userId = useAuthStore.getState().user?.id ?? 'public'
  return `${userId}:${cacheKey}`
}

function cachedData<T>(key: string | null): T | null {
  if (!key) return null
  const entry = resourceCache.get(key)
  return entry && 'data' in entry ? entry.data as T : null
}

// `deps` drives refetching, exactly like a useEffect dependency array: pass the
// values the fetch depends on (an id, a date, a filter). `fetcher` may be an
// inline arrow — it's read through a ref, so it doesn't need to be memoized or
// listed in `deps`.
export function useApiResource<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  options: ApiResourceOptions = {},
): ApiResource<T> {
  const initialKey = scopedCacheKey(options.cacheKey)
  const initialData = cachedData<T>(initialKey)
  const [data, setData]       = useState<T | null>(initialData)
  const [loading, setLoading] = useState(options.enabled !== false && initialData === null)
  const [error, setError]     = useState<ApiError | null>(null)

  // Always call the latest fetcher without making it a dependency, so callers
  // can pass a fresh arrow each render without retriggering the fetch. The ref
  // is repointed in an effect (never during render) per the rules of hooks;
  // this effect is declared before the load effect below so the ref is current
  // before any (re)fetch reads it.
  const fetcherRef = useRef(fetcher)
  const optionsRef = useRef(options)
  useEffect(() => {
    fetcherRef.current = fetcher
    optionsRef.current = options
  })

  // Guards against setting state from a stale request: if deps change (or the
  // component unmounts) before an in-flight fetch resolves, its result is
  // dropped rather than overwriting newer data.
  const requestId = useRef(0)

  const load = useCallback(async (force = true) => {
    const currentOptions = optionsRef.current
    if (currentOptions.enabled === false) {
      setLoading(false)
      return
    }

    const id = ++requestId.current
    const key = scopedCacheKey(currentOptions.cacheKey)
    const cached = key ? resourceCache.get(key) : undefined
    const hasCachedData = Boolean(cached && 'data' in cached)
    const staleTime = currentOptions.staleTime ?? 0

    if (!force && cached && hasCachedData && Date.now() - cached.updatedAt < staleTime) {
      setData(cached.data as T)
      setLoading(false)
      setError(null)
      return
    }

    if (hasCachedData) setData(cached!.data as T)
    setLoading(!hasCachedData)
    setError(null)
    try {
      let request = cached?.promise as Promise<T> | undefined
      if (!request) {
        request = fetcherRef.current()
        if (key) {
          resourceCache.set(key, { ...cached, updatedAt: cached?.updatedAt ?? 0, promise: request })
          void request.finally(() => {
            const current = resourceCache.get(key)
            if (current && current.promise === request) {
              if ('data' in current) {
                resourceCache.set(key, { data: current.data, updatedAt: current.updatedAt })
              } else {
                resourceCache.delete(key)
              }
            }
          }).catch(() => undefined)
        }
      }

      const result = await request
      if (key) resourceCache.set(key, { data: result, updatedAt: Date.now() })
      if (id === requestId.current) {
        setData(result)
      }
    } catch (err) {
      if (id === requestId.current) {
        setError(toApiError(err))
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void load(false)
    // On unmount (or before a re-run), bump the id so any in-flight response is
    // ignored by the guards above. Reading the live ref here is intentional.
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      requestId.current++
    }
    // Refetch is keyed off the caller-provided dep array, which is intentionally
    // not a literal; `load` is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, options.enabled, options.cacheKey, options.staleTime, ...deps])

  const refetch = useCallback(() => load(true), [load])
  return { data, loading, error, refetch }
}
