import { CheckCircle2 } from 'lucide-react'
import { formatTodayLong } from '../shared/utils'

interface ConfirmedScreenProps {
  studentName: string
  checkInTime: string
  instructorName?: string
}

export default function ConfirmedScreen({ studentName, checkInTime, instructorName }: ConfirmedScreenProps) {
  return (
    <>
      <div className="w-16 h-16 rounded-full bg-success-bg text-success flex items-center justify-center">
        <CheckCircle2 size={36} />
      </div>
      <div>
        <h1 className="text-[19px] font-semibold text-gray-900">You're checked in!</h1>
        <p className="text-[14px] text-gray-700 font-medium mt-2">{studentName}</p>
        <p className="text-[13px] text-gray-500 mt-1">{formatTodayLong()} · {checkInTime}</p>
        {instructorName && <p className="text-[13px] text-gray-500">Instructor: {instructorName}</p>}
      </div>
      <p className="text-[14.5px] text-gray-700 mt-2">Have a great lesson! 🚗</p>
    </>
  )
}
