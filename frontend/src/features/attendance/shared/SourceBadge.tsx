import { Smartphone, PenLine } from 'lucide-react'
import type { CheckInSource } from './types'

export default function SourceBadge({ source }: { source: CheckInSource }) {
  const isSelf = source === 'self'
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap ${isSelf ? 'text-brand-600' : 'text-gray-500'}`}>
      {isSelf ? <Smartphone size={11} /> : <PenLine size={11} />}
      {isSelf ? 'Self' : 'Manual'}
    </span>
  )
}
