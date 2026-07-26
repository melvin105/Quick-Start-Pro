import type { Student } from '../types'

export default function NotesCard({ student }: { student: Student }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h2>
      <p className="text-[13.5px] text-gray-700 whitespace-pre-wrap">
        {student.notes && student.notes.trim() !== '' ? student.notes : 'No notes added.'}
      </p>
    </div>
  )
}
