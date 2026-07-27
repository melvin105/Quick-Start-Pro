import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { PendingSubmission } from '../shared/types'
import { ROUTES } from '../../../lib/constants'

interface PendingSubmissionsProps {
  items: PendingSubmission[]
}

export default function PendingSubmissions({ items }: PendingSubmissionsProps) {
  const navigate = useNavigate()

  const handleComplete = (id: string) => {
    navigate(`${ROUTES.STUDENTS_REGISTER}?resume=${id}`)
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
        No pending submissions.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12.5px] text-gray-500">QR self-submissions awaiting completion</p>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Name', 'Phone', 'Submitted', 'Action'].map((col) => (
                  <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{item.name}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{item.phone}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{item.submittedLabel}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleComplete(item.id)}
                      className="flex items-center gap-1.5 text-[12.5px] font-medium text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Complete <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4">
            <p className="text-[14px] font-medium text-gray-900">{item.name}</p>
            <p className="text-[12.5px] text-gray-500 mt-0.5">{item.phone} · {item.submittedLabel}</p>
            <button
              type="button"
              onClick={() => handleComplete(item.id)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-white bg-brand-600 hover:bg-brand-700 px-3 py-2 rounded-md transition-colors"
            >
              Complete <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
