import { useState } from 'react'
import { useParams, useSearchParams, Navigate } from 'react-router-dom'
import useStudentsStore from '../../features/students/shared/store'
import ManagerProfileHeader from '../../features/students/manager/ManagerProfileHeader'
import ManagerSummaryCards from '../../features/students/manager/ManagerSummaryCards'
import ManagerProfileTabs, { type ManagerProfileTabKey } from '../../features/students/manager/ManagerProfileTabs'
import NotesCard from '../../features/students/shared/profile/NotesCard'
import { ROUTES } from '../../lib/constants'

const VALID_TABS: ManagerProfileTabKey[] = ['overview', 'payments', 'lessons', 'attendance', 'licence', 'activity']

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const student = useStudentsStore((s) => s.students.find((st) => st.id === id))

  const initialTab = VALID_TABS.find((t) => t === searchParams.get('tab')) ?? 'overview'
  const [tab, setTab] = useState<ManagerProfileTabKey>(initialTab)

  if (!student) {
    return <Navigate to={ROUTES.STUDENTS} replace />
  }

  return (
    <div className="flex flex-col gap-6">
      <ManagerProfileHeader student={student} />
      <ManagerSummaryCards student={student} onViewReceipts={() => setTab('payments')} />
      <ManagerProfileTabs student={student} tab={tab} onTabChange={setTab} />
      <NotesCard student={student} />
    </div>
  )
}
