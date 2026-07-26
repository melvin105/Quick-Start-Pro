import { UserCog } from 'lucide-react'
import PagePlaceholder from '../components/layout/PagePlaceholder'

export default function StaffPage() {
  return (
    <PagePlaceholder
      icon={UserCog}
      title="Staff"
      description="Manage instructor and secretary accounts."
    />
  )
}
