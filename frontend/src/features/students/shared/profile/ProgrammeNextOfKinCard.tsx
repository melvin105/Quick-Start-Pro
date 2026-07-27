import type { Student } from '../types'
import { formatDate } from '../utils'
import DetailRow from './DetailRow'

export default function ProgrammeNextOfKinCard({ student }: { student: Student }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Programme &amp; Next of Kin</h2>
      <div className="divide-y divide-gray-100">
        <DetailRow label="Enrolment Type" value={student.enrolment} />
        <DetailRow label="Package" value={student.programme} />
        <DetailRow label="Registration Date" value={student.registrationDate ? formatDate(student.registrationDate) : undefined} />
        <DetailRow label="Next of Kin" value={`${student.nextOfKin.name} (${student.nextOfKin.phone})`} />
      </div>
    </div>
  )
}
