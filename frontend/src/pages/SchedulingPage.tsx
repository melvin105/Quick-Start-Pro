import { CalendarClock } from 'lucide-react'
import PagePlaceholder from '../components/layout/PagePlaceholder'

export default function SchedulingPage() {
  return (
    <PagePlaceholder
      icon={CalendarClock}
      title="Scheduling"
      description="Plan and manage driving lessons."
    />
  )
}
