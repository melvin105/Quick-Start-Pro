import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface InfoScreenProps {
  icon: LucideIcon
  tone: 'warning' | 'success'
  heading: string
  description: string
  children?: ReactNode
}

export default function InfoScreen({ icon: Icon, tone, heading, description, children }: InfoScreenProps) {
  return (
    <>
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center ${
          tone === 'warning' ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success'
        }`}
      >
        <Icon size={32} />
      </div>
      <div>
        <h1 className="text-[17px] font-semibold text-gray-900">{heading}</h1>
        <p className="text-[13.5px] text-gray-500 mt-1.5">{description}</p>
      </div>
      {children}
    </>
  )
}
