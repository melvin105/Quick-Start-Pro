import type { Student } from '../types'
import { formatDate } from '../utils'
import DetailRow from './DetailRow'

interface ProgrammeNextOfKinCardProps {
  student: Student
}

// Read-only summary of the student's programme and next-of-kin. The package is
// set (and changed) from the Edit Student form, not from here.
export default function ProgrammeNextOfKinCard({ student }: ProgrammeNextOfKinCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Programme &amp; Next of Kin</h2>
      <div className="divide-y divide-gray-100">
        <DetailRow label="Package" value={student.programme} />
        <DetailRow label="Registration Date" value={student.registrationDate ? formatDate(student.registrationDate) : undefined} />
        <DetailRow
          label="Emergency Contact"
          value={student.nextOfKin.phone ? `${student.nextOfKin.name} (${student.nextOfKin.phone})` : student.nextOfKin.name}
        />
      </div>
    </div>
  )
}
