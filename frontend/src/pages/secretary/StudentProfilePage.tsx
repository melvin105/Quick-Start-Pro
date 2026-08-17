import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ProfileHeader from '../../features/students/shared/profile/ProfileHeader'
import SummaryCards from '../../features/students/shared/profile/SummaryCards'
import ProfileTabs, { type ProfileTabKey } from '../../features/students/shared/profile/ProfileTabs'
import NotesCard from '../../features/students/shared/profile/NotesCard'
import { getStudent } from '../../features/students/shared/studentService'
import { toStudentProfile } from '../../features/students/shared/studentProfileMapper'
import { useApiResource } from '../../lib/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, refetch } = useApiResource(() => getStudent(id ?? ''), [id])
  const [tab, setTab] = useState<ProfileTabKey>('overview')

  if (loading) return <LoadingState message="Loading student profile…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!data) return null

  const student = toStudentProfile(data)

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader student={student} />
      <SummaryCards student={student} onViewReceipts={() => setTab('payments')} />
      <ProfileTabs student={student} tab={tab} onTabChange={setTab} />
      <NotesCard student={student} />
    </div>
  )
}
