import { useState } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useStaffStore from '../../features/staff/store'
import DetailRow from '../../features/students/shared/profile/DetailRow'
import SalaryHistoryTab from '../../features/staff/SalaryHistoryTab'
import LessonsTab from '../../features/staff/LessonsTab'
import { getInitials, roleLabel, formatAddedDate } from '../../features/staff/utils'
import { ROUTES } from '../../lib/constants'

type TabKey = 'details' | 'salary' | 'lessons'

export default function StaffProfilePage() {
  const { id } = useParams<{ id: string }>()
  const staff = useStaffStore((s) => s.staff.find((m) => m.id === id))
  const [tab, setTab] = useState<TabKey>('details')

  if (!staff) {
    return <Navigate to={ROUTES.STAFF} replace />
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'salary',  label: 'Salary History' },
    ...(staff.role === 'instructor' ? [{ key: 'lessons' as const, label: 'Lessons' }] : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-gray-500">Dashboard / Staff / {staff.name}</p>
        <Link to={ROUTES.STAFF} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
          <ArrowLeft size={14} /> Back to Staff
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-full bg-success-bg text-success flex items-center justify-center text-[17px] font-semibold shrink-0">
          {getInitials(staff.name)}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{staff.name}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
              {roleLabel(staff.role)}
            </span>
            <span className="text-[12.5px] text-gray-500">Added: {formatAddedDate(staff.addedDate)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-5 border-b border-gray-200 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`pb-3 text-[13.5px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'details' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-md">
            <div className="divide-y divide-gray-100">
              <DetailRow label="Name" value={staff.name} />
              <DetailRow label="Role" value={roleLabel(staff.role)} />
              <DetailRow label="Phone" value={staff.phone} />
            </div>
          </div>
        )}

        {tab === 'salary' && <SalaryHistoryTab staff={staff} />}
        {tab === 'lessons' && staff.role === 'instructor' && <LessonsTab staff={staff} />}
      </div>
    </div>
  )
}
