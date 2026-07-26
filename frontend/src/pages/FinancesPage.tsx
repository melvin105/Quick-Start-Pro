import { Wallet } from 'lucide-react'
import PagePlaceholder from '../components/layout/PagePlaceholder'

export default function FinancesPage() {
  return (
    <PagePlaceholder
      icon={Wallet}
      title="Finances"
      description="Revenue, expenses, and profit overview."
    />
  )
}
