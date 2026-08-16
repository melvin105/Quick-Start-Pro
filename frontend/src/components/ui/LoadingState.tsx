import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  // Optional message under the spinner, e.g. "Loading dashboard…".
  message?: string
  // Minimum height so the spinner sits centered in a card/section.
  className?: string
}

// Shared loading indicator for the service-layer read states (useApiResource
// `loading`). Kept intentionally plain so it reads the same on every screen.
export default function LoadingState({ message = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-gray-500 ${className ?? ''}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 size={22} className="animate-spin text-brand-600" />
      <p className="text-[13px]">{message}</p>
    </div>
  )
}
