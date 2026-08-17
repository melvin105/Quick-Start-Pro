import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ManagerProfileHeader from '../../features/students/manager/ManagerProfileHeader'
import ManagerSummaryCards from '../../features/students/manager/ManagerSummaryCards'
import ManagerProfileTabs, { type ManagerProfileTabKey } from '../../features/students/manager/ManagerProfileTabs'
import NotesCard from '../../features/students/shared/profile/NotesCard'
import { getStudent } from '../../features/students/shared/studentService'
import { toStudentProfile } from '../../features/students/shared/studentProfileMapper'
import { useApiResource } from '../../lib/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

const VALID_TABS: ManagerProfileTabKey[] = ['overview', 'payments', 'lessons', 'attendance', 'licence', 'activity']

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const { data, loading, error, refetch } = useApiResource(() => getStudent(id ?? ''), [id])

  const initialTab = VALID_TABS.find((t) => t === searchParams.get('tab')) ?? 'overview'
  const [tab, setTab] = useState<ManagerProfileTabKey>(initialTab)

  if (loading) return <LoadingState message="Loading student profile…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!data) return null

  const student = toStudentProfile(data)

  return (
    <div className="flex flex-col gap-6">
      <ManagerProfileHeader student={student} />
      <ManagerSummaryCards student={student} onViewReceipts={() => setTab('payments')} />
      <ManagerProfileTabs student={student} tab={tab} onTabChange={setTab} />
      <NotesCard student={student} />
    </div>
  )
}
