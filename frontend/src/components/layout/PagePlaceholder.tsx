import type { LucideIcon } from 'lucide-react'

interface PagePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
}

export default function PagePlaceholder({ title, description, icon: Icon }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center gap-3 bg-white border border-dashed border-gray-300 rounded-2xl py-16 px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <Icon size={22} />
        </div>
        <p className="text-[14.5px] font-medium text-gray-800">{title} is coming soon</p>
        <p className="text-[13px] text-gray-500 max-w-xs">
          This screen is scaffolded and ready to be built out.
        </p>
      </div>
    </div>
  )
}
