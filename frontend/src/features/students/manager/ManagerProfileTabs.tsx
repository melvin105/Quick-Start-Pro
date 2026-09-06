import type { Student } from '../shared/types'
import PersonalDetailsCard from '../shared/profile/PersonalDetailsCard'
import ProgrammeNextOfKinCard from '../shared/profile/ProgrammeNextOfKinCard'
import PaymentsTabContent from '../shared/profile/PaymentsTabContent'
import LessonsTabContent from '../shared/profile/LessonsTabContent'
import StudentAttendanceTabContent from './StudentAttendanceTabContent'
import StudentLicenceTabContent from './StudentLicenceTabContent'
import StudentActivityTabContent from './StudentActivityTabContent'
import StudentWeeklyScheduleCard from '../shared/profile/StudentWeeklyScheduleCard'

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
  const canTakeDrivingLessons = student.enrolment !== 'Licence Only'
  const visibleTabs = canTakeDrivingLessons ? TABS : TABS.filter((item) => item.key !== 'lessons')
  const activeTab = !canTakeDrivingLessons && tab === 'lessons' ? 'overview' : tab

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-5 border-b border-gray-200 overflow-x-auto">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onTabChange(t.key)}
            className={`pb-3 text-[13.5px] font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PersonalDetailsCard student={student} />
          <ProgrammeNextOfKinCard student={student} />
          {canTakeDrivingLessons && (
            <div className="lg:col-span-2">
              <StudentWeeklyScheduleCard studentId={student.id} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments'   && <PaymentsTabContent student={student} />}
      {activeTab === 'lessons'    && canTakeDrivingLessons && <LessonsTabContent student={student} />}
      {activeTab === 'attendance' && <StudentAttendanceTabContent student={student} />}
      {activeTab === 'licence'    && <StudentLicenceTabContent student={student} />}
      {activeTab === 'activity'   && <StudentActivityTabContent student={student} />}
    </div>
  )
}
