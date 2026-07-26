import type { Student } from '../types'
import { formatDate } from '../utils'
import DetailRow from './DetailRow'

export default function PersonalDetailsCard({ student }: { student: Student }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Personal Details</h2>
      <div className="divide-y divide-gray-100">
        <DetailRow label="Phone" value={student.phone} />
        <DetailRow label="Email" value={student.email} />
        <DetailRow label="Address" value={student.address} />
        <DetailRow label="Date of Birth" value={formatDate(student.dob)} />
        <DetailRow label="ID" value={student.ghanaCardNumber ? `Ghana Card - ${student.ghanaCardNumber}` : undefined} />
      </div>
    </div>
  )
}
