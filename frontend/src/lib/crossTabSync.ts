// Zustand's `persist` middleware only reads localStorage once, on init — it
// doesn't notice writes made by other tabs. Without this, a check-in
// submitted from the public /check-in page (or a registration from
// /register) in one tab wouldn't show up on an already-open secretary tab
// until it was manually reloaded. This bridges that gap for same-browser
// testing; real cross-device sync still needs the backend.
export function syncStoreAcrossTabs(storageKey: string, rehydrate: () => void) {
  window.addEventListener('storage', (e) => {
    if (e.key === storageKey) rehydrate()
  })
}
