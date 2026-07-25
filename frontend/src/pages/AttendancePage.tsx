import { ClipboardCheck } from 'lucide-react'
import PagePlaceholder from '../components/layout/PagePlaceholder'

export default function AttendancePage() {
  return (
    <PagePlaceholder
      icon={ClipboardCheck}
      title="Attendance"
      description="Track lesson attendance."
    />
  )
}
