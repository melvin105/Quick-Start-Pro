import { useCallback, useEffect, useRef, useState } from 'react'
import { toApiError, type ApiError } from './apiError'

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

// `deps` drives refetching, exactly like a useEffect dependency array: pass the
// values the fetch depends on (an id, a date, a filter). `fetcher` may be an
// inline arrow — it's read through a ref, so it doesn't need to be memoized or
// listed in `deps`.
export function useApiResource<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
): ApiResource<T> {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<ApiError | null>(null)

  // Always call the latest fetcher without making it a dependency, so callers
  // can pass a fresh arrow each render without retriggering the fetch. The ref
  // is repointed in an effect (never during render) per the rules of hooks;
  // this effect is declared before the load effect below so the ref is current
  // before any (re)fetch reads it.
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  // Guards against setting state from a stale request: if deps change (or the
  // component unmounts) before an in-flight fetch resolves, its result is
  // dropped rather than overwriting newer data.
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
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
    // A data hook must reset to the loading state whenever its inputs change;
    // that synchronous setState on (re)run is the intended behavior here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // On unmount (or before a re-run), bump the id so any in-flight response is
    // ignored by the guards above. Reading the live ref here is intentional.
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      requestId.current++
    }
    // Refetch is keyed off the caller-provided dep array, which is intentionally
    // not a literal; `load` is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, ...deps])

  return { data, loading, error, refetch: load }
}
