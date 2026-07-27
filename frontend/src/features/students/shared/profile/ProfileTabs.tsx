import type { Student } from '../types'
import PersonalDetailsCard from './PersonalDetailsCard'
import ProgrammeNextOfKinCard from './ProgrammeNextOfKinCard'
import PaymentsTabContent from './PaymentsTabContent'
import LessonsTabContent from './LessonsTabContent'

export type ProfileTabKey = 'overview' | 'payments' | 'lessons'

const TABS: { key: ProfileTabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'payments', label: 'Payments' },
  { key: 'lessons',  label: 'Lessons' },
]

interface ProfileTabsProps {
  student: Student
  tab: ProfileTabKey
  onTabChange: (tab: ProfileTabKey) => void
}

export default function ProfileTabs({ student, tab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-5 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onTabChange(t.key)}
            className={`pb-3 text-[13.5px] font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PersonalDetailsCard student={student} />
          <ProgrammeNextOfKinCard student={student} />
        </div>
      )}

      {tab === 'payments' && <PaymentsTabContent student={student} />}
      {tab === 'lessons' && <LessonsTabContent student={student} />}
    </div>
  )
}
