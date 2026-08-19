import StudentAvatar from '../../students/shared/StudentAvatar'
import type { CheckinStudent } from './checkinService'

interface ConfirmScreenProps {
  student: CheckinStudent
  onConfirm: () => void
  onNotMe: () => void
}

export default function ConfirmScreen({ student, onConfirm, onNotMe }: ConfirmScreenProps) {
  return (
    <>
      <h1 className="text-[18px] font-semibold text-gray-900">Is this you?</h1>
      <StudentAvatar name={student.name} photo={student.photoUrl ?? undefined} className="w-16 h-16 text-[20px]" />
      <div>
        <p className="text-[16px] font-semibold text-gray-900">{student.name}</p>
        <p className="text-[13px] text-gray-500 mt-0.5">{student.studentNumber}</p>
      </div>
      <div className="w-full flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={onConfirm}
          className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[15px] rounded-xl transition-colors"
        >
          ✅ Yes, check me in
        </button>
        <button
          type="button"
          onClick={onNotMe}
          className="w-full py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-[14px] rounded-xl transition-colors"
        >
          ✗ Not me — try again
        </button>
      </div>
    </>
  )
}
