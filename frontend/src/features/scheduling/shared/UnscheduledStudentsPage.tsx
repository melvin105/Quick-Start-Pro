import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import LoadingState from '../../../components/ui/LoadingState'
import ErrorState from '../../../components/ui/ErrorState'
import { ROUTES } from '../../../lib/constants'
import { useApiResource } from '../../../lib/useApiResource'
import { listSlots } from './schedulingService'
import UnscheduledStudentsPanel from './UnscheduledStudentsPanel'

export default function UnscheduledStudentsPage() {
  const { data, loading, error, refetch } = useApiResource(listSlots)

  if (loading) return <LoadingState message="Loading unscheduled students…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[12px] text-gray-500">Dashboard / Schedule / Unscheduled Students</p>
        <Link
          to={ROUTES.SCHEDULING}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[12.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft size={14} />
          Back to Schedule
        </Link>
      </div>

      <UnscheduledStudentsPanel students={data?.unscheduledStudents ?? []} standalone />
    </div>
  )
}
