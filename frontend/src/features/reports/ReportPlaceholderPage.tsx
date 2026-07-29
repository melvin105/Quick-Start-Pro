import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ROUTES } from '../../lib/constants'

interface ReportPlaceholderPageProps {
  title: string
}

export default function ReportPlaceholderPage({ title }: ReportPlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Reports / {title}</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        <Link to={ROUTES.REPORTS} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
          <ArrowLeft size={14} /> Back to Reports
        </Link>
      </div>

      {/* Filter bar skeleton */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-9 w-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-9 w-40 bg-gray-100 rounded-lg animate-pulse" />
      </div>

      {/* Coming soon table outline */}
      <div className="bg-white border border-dashed border-gray-300 rounded-2xl overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 flex gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-3 w-20 bg-gray-100 rounded" />)}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-4 py-3.5 border-b border-gray-50 last:border-0 flex gap-6">
            {[1, 2, 3, 4].map((j) => <div key={j} className="h-3 w-16 bg-gray-50 rounded" />)}
          </div>
        ))}
        <div className="py-12 text-center text-[13px] text-gray-400">Coming soon</div>
      </div>
    </div>
  )
}
