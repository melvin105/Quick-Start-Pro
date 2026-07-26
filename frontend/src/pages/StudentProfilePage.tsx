import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import useStudentsStore from '../features/students/store'
import ProfileHeader from '../features/students/profile/ProfileHeader'
import SummaryCards from '../features/students/profile/SummaryCards'
import ProfileTabs, { type ProfileTabKey } from '../features/students/profile/ProfileTabs'
import NotesCard from '../features/students/profile/NotesCard'
import { ROUTES } from '../lib/constants'

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const student = useStudentsStore((s) => s.students.find((st) => st.id === id))
  const [tab, setTab] = useState<ProfileTabKey>('overview')

  if (!student) {
    return <Navigate to={ROUTES.STUDENTS} replace />
  }

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader student={student} />
      <SummaryCards student={student} onViewReceipts={() => setTab('payments')} />
      <ProfileTabs student={student} tab={tab} onTabChange={setTab} />
      <NotesCard student={student} />
    </div>
  )
}
