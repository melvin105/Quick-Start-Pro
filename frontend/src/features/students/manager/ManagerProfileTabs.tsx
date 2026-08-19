import type { Student } from '../shared/types'
import PersonalDetailsCard from '../shared/profile/PersonalDetailsCard'
import ProgrammeNextOfKinCard from '../shared/profile/ProgrammeNextOfKinCard'
import PaymentsTabContent from '../shared/profile/PaymentsTabContent'
import LessonsTabContent from '../shared/profile/LessonsTabContent'
import StudentAttendanceTabContent from './StudentAttendanceTabContent'
import StudentLicenceTabContent from './StudentLicenceTabContent'
import StudentActivityTabContent from './StudentActivityTabContent'

export type ManagerProfileTabKey = 'overview' | 'payments' | 'lessons' | 'attendance' | 'licence' | 'activity'

const TABS: { key: ManagerProfileTabKey; label: string }[] = [
  { key: 'overview',   label: 'Overview' },
  { key: 'payments',   label: 'Payments' },
  { key: 'lessons',    label: 'Lessons' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'licence',    label: 'Licence' },
  { key: 'activity',   label: 'Activity' },
]

interface ManagerProfileTabsProps {
  student: Student
  tab: ManagerProfileTabKey
  onTabChange: (tab: ManagerProfileTabKey) => void
}

export default function ManagerProfileTabs({ student, tab, onTabChange }: ManagerProfileTabsProps) {
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

      {tab === 'payments'   && <PaymentsTabContent student={student} />}
      {tab === 'lessons'    && <LessonsTabContent student={student} />}
      {tab === 'attendance' && <StudentAttendanceTabContent student={student} />}
      {tab === 'licence'    && <StudentLicenceTabContent student={student} />}
      {tab === 'activity'   && <StudentActivityTabContent student={student} />}
    </div>
  )
}
