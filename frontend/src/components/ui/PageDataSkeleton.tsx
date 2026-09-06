interface PageDataSkeletonProps {
  title?: string
  statCards?: number
  panels?: number
}

// Keeps the page's useful shape visible while real data is in flight. The
// blocks use the final responsive grids, avoiding a large layout jump.
export default function PageDataSkeleton({
  title,
  statCards = 4,
  panels = 1,
}: PageDataSkeletonProps) {
  return (
    <div className="flex flex-col gap-5 animate-pulse" role="status" aria-label="Loading page data">
      {title && (
        <div className="flex flex-col gap-1">
          <div className="h-3 w-28 rounded bg-gray-200" />
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: statCards }, (_, index) => (
          <div key={index} className="h-24 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="mt-4 h-6 w-24 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 ${panels > 1 ? 'lg:grid-cols-2' : ''} gap-4`}>
        {Array.from({ length: panels }, (_, index) => (
          <div key={index} className="h-64 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-6 space-y-4">
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-4/5 rounded bg-gray-100" />
              <div className="h-3 w-11/12 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
