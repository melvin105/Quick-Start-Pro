import type { Student } from '../types'

export default function LessonsTabContent({ student }: { student: Student }) {
  const total = student.lessonsPackageTotal ?? 0
  const taken = student.lessonsTaken ?? 0
  const remaining = Math.max(total - taken, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-1 text-center">
      <p className="text-[13px] text-gray-500">Lessons Remaining</p>
      <p className="text-4xl font-semibold text-gray-900">{remaining}</p>
      <p className="text-[12.5px] text-gray-500">out of {total} in package</p>
    </div>
  )
}
