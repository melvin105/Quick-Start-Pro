import { CreditCard } from 'lucide-react'
import PagePlaceholder from '../components/layout/PagePlaceholder'

export default function PaymentsPage() {
  return (
    <PagePlaceholder
      icon={CreditCard}
      title="Payments"
      description="Record and review student payments."
    />
  )
}
