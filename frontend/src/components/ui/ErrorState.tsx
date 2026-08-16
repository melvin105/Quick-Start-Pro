import { AlertCircle } from 'lucide-react'
import type { ApiError } from '../../lib/apiError'

interface ErrorStateProps {
  // The normalized error from the service layer (useApiResource `error`).
  error: ApiError
  // Wire this to the resource's `refetch` to offer a retry.
  onRetry?: () => void
  className?: string
}

// Shared error panel for service-layer read failures. It shows the normalized
// ApiError message (which already distinguishes unauthorized / not-found /
// network / server errors) and an optional Retry that re-runs the fetch.
export default function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 px-6 text-center ${className ?? ''}`}
      role="alert"
    >
      <div className="w-11 h-11 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
        <AlertCircle size={20} />
      </div>
      <p className="text-[14px] font-medium text-gray-800">Couldn't load this</p>
      <p className="text-[13px] text-gray-500 max-w-xs">{error.message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 text-[13px] font-medium text-brand-600 hover:text-brand-700"
        >
          Try again
        </button>
      )}
    </div>
  )
}
