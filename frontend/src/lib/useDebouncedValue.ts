import { useEffect, useState } from 'react'

// Delays propagating a rapidly-changing value (e.g. a search box) so dependent
// effects — like a server fetch keyed on the value — fire once the user pauses
// typing rather than on every keystroke.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
