type DeltaTone = 'positive' | 'negative' | 'neutral' | 'warning'

interface StatCardProps {
  label: string
  value: string
  delta?: { text: string; tone: DeltaTone }
  tone?: 'default' | 'positive' | 'warning'
}

const CARD_TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, string> = {
  default:  'bg-white border-gray-200',
  positive: 'bg-success-bg border-success/20',
  warning:  'bg-warning-bg border-warning/20',
}

const DELTA_TONE_CLASSES: Record<DeltaTone, string> = {
  positive: 'text-success',
  negative: 'text-danger',
  neutral:  'text-gray-500',
  warning:  'text-warning',
}

export default function StatCard({ label, value, delta, tone = 'default' }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${CARD_TONE_CLASSES[tone]}`}>
      <p className="text-[12.5px] text-gray-500 font-medium">{label}</p>
      <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1.5">{value}</p>
      {delta && (
        <p className={`text-[11.5px] font-medium mt-1.5 ${DELTA_TONE_CLASSES[delta.tone]}`}>{delta.text}</p>
      )}
    </div>
  )
}
