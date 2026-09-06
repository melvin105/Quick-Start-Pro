import type { Student } from '../shared/types'
import ManagerPaymentsCard from './ManagerPaymentsCard'
import ManagerLessonsCard from './ManagerLessonsCard'
import ManagerLicenceProgressCard from './ManagerLicenceProgressCard'

interface ManagerSummaryCardsProps {
  student: Student
  onViewReceipts: () => void
}

export default function ManagerSummaryCards({ student, onViewReceipts }: ManagerSummaryCardsProps) {
  const showLessonsCard = student.enrolment !== 'Licence Only'
  const showLicenceCard = student.enrolment !== 'Driving Only'
  const hasThreeCards = showLessonsCard && showLicenceCard

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasThreeCards ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
      <ManagerPaymentsCard student={student} onViewReceipts={onViewReceipts} />
      {showLessonsCard && <ManagerLessonsCard student={student} />}
      {showLicenceCard && <ManagerLicenceProgressCard student={student} />}
    </div>
  )
}
