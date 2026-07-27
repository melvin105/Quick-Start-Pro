import type { Student } from '../types'
import PaymentsCard from './PaymentsCard'
import LessonsCard from './LessonsCard'
import LicenceProgressCard from './LicenceProgressCard'

interface SummaryCardsProps {
  student: Student
  onViewReceipts: () => void
}

export default function SummaryCards({ student, onViewReceipts }: SummaryCardsProps) {
  const showLicenceCard = student.enrolment !== 'Driving Only'

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${showLicenceCard ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
      <PaymentsCard student={student} onViewReceipts={onViewReceipts} />
      <LessonsCard student={student} />
      {showLicenceCard && <LicenceProgressCard student={student} />}
    </div>
  )
}
