import { Wallet } from 'lucide-react'
import PagePlaceholder from '../../components/ui/PagePlaceholder'

export default function FinancesPage() {
  return (
    <PagePlaceholder
      icon={Wallet}
      title="Finances"
      description="Revenue, expenses, and profit overview."
    />
  )
}
