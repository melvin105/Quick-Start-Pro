import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import DetailRow from '../../features/students/shared/profile/DetailRow'
import LessonsTab from '../../features/staff/LessonsTab'
import { getInitials, roleLabel, formatAddedDate } from '../../features/staff/utils'
import { getInstructor, removeInstructor } from '../../features/staff/staffService'
import { useApiResource } from '../../lib/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import { ROUTES } from '../../lib/constants'

type TabKey = 'details' | 'lessons'

export default function StaffProfilePage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: staff, loading, error, refetch } = useApiResource(() => getInstructor(id), [id])
  const [tab, setTab] = useState<TabKey>('details')
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const [removing, setRemoving] = useState(false)

  if (loading) return <LoadingState message="Loading instructor…" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!staff) return null

  const handleRemove = async () => {
    setRemoving(true)
    await removeInstructor(staff.id)
    navigate(ROUTES.STAFF, { replace: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] text-gray-500">Dashboard / Staff / {staff.name}</p>
        <Link to={ROUTES.STAFF} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0"><ArrowLeft size={14} /> Back to Staff</Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-3.5 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-success-bg text-success flex items-center justify-center text-[17px] font-semibold shrink-0">{getInitials(staff.name)}</div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{staff.name}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">{roleLabel(staff.role)}</span>
              <span className="text-[12.5px] text-gray-500">Added: {formatAddedDate(staff.addedDate)}</span>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setConfirmingRemove(true)} className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-danger bg-white border border-gray-200 rounded-lg hover:bg-danger-bg transition-colors"><Trash2 size={14} /> Remove Instructor</button>
      </div>

      {confirmingRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setConfirmingRemove(false)} />
          <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5 flex flex-col gap-3">
            <h2 className="text-[15px] font-semibold text-gray-900">Remove {staff.name}?</h2>
            <p className="text-[13px] text-gray-600">Instructors with historical records will be deactivated so their lesson history remains intact.</p>
            <div className="flex justify-end gap-2 mt-1">
              <button type="button" onClick={() => setConfirmingRemove(false)} className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg">Cancel</button>
              <button type="button" disabled={removing} onClick={handleRemove} className="px-4 py-2 text-[13px] font-medium text-white bg-danger disabled:opacity-50 rounded-lg">{removing ? 'Removing…' : 'Remove'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-5 border-b border-gray-200">
          {(['details', 'lessons'] as TabKey[]).map((key) => <button key={key} type="button" onClick={() => setTab(key)} className={`pb-3 text-[13.5px] font-medium capitalize border-b-2 ${tab === key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500'}`}>{key}</button>)}
        </div>
        {tab === 'details' && <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-md"><div className="divide-y divide-gray-100">
          <DetailRow label="Name" value={staff.name} /><DetailRow label="Role" value={roleLabel(staff.role)} /><DetailRow label="Phone" value={staff.phone} /><DetailRow label="Email" value={staff.email ?? '—'} /><DetailRow label="Status" value={staff.status} />
        </div></div>}
        {tab === 'lessons' && <LessonsTab staff={staff} />}
      </div>
    </div>
  )
}
