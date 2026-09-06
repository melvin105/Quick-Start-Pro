import type { Student } from '../types'
import PaymentsCard from './PaymentsCard'
import LessonsCard from './LessonsCard'
import LicenceProgressCard from './LicenceProgressCard'

interface SummaryCardsProps {
  student: Student
  onViewReceipts: () => void
}

export default function SummaryCards({ student, onViewReceipts }: SummaryCardsProps) {
  const showLessonsCard = student.enrolment !== 'Licence Only'
  const showLicenceCard = student.enrolment !== 'Driving Only'
  const hasThreeCards = showLessonsCard && showLicenceCard

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasThreeCards ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
      <PaymentsCard student={student} onViewReceipts={onViewReceipts} />
      {showLessonsCard && <LessonsCard student={student} />}
      {showLicenceCard && <LicenceProgressCard student={student} />}
    </div>
  )
}
