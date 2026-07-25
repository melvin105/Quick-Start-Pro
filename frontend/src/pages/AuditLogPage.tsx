import { History } from 'lucide-react'
import PagePlaceholder from '../components/layout/PagePlaceholder'

export default function AuditLogPage() {
  return (
    <PagePlaceholder
      icon={History}
      title="Audit Log"
      description="A history of account and record changes."
    />
  )
}
