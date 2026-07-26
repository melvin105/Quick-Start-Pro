import { Settings } from 'lucide-react'
import PagePlaceholder from '../components/layout/PagePlaceholder'

export default function SettingsPage() {
  return (
    <PagePlaceholder
      icon={Settings}
      title="Settings"
      description="Manage school and account settings."
    />
  )
}
