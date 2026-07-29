import { Link } from 'react-router-dom'
import { ArrowRight, type LucideIcon } from 'lucide-react'

interface ReportCardProps {
  icon:        LucideIcon
  iconClass:   string
  title:       string
  description: string
  to:          string
}

export default function ReportCard({ icon: Icon, iconClass, title, description, to }: ReportCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}>
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-[14.5px] font-semibold text-gray-900">{title}</h2>
        <p className="text-[12.5px] text-gray-500 mt-1">{description}</p>
      </div>
      <Link to={to} className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start">
        Generate <ArrowRight size={13} />
      </Link>
    </div>
  )
}
