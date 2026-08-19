import type { Student } from '../shared/types'

export default function ManagerLessonsCard({ student }: { student: Student }) {
  const total = student.lessonsPackageTotal ?? 0
  const taken = student.lessonsTaken ?? 0
  const remaining = Math.max(total - taken, 0)
  const pct = total > 0 ? Math.round((taken / total) * 100) : 0

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Lessons</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11.5px] text-gray-500">Package Total</p>
          <p className="text-[14.5px] font-semibold text-gray-900">{total} lessons</p>
        </div>
        <div>
          <p className="text-[11.5px] text-gray-500">Remaining</p>
          <p className="text-[14.5px] font-semibold text-gray-900">{remaining}</p>
        </div>
      </div>

      <div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-600 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11.5px] text-gray-400 mt-1.5">{taken} attended · {pct}%</p>
      </div>
    </div>
  )
}
