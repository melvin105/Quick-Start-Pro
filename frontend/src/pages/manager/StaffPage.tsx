import { useState } from 'react'
import { Plus } from 'lucide-react'
import StaffCard from '../../features/staff/StaffCard'
import AddStaffModal from '../../features/staff/AddStaffModal'
import { listInstructors } from '../../features/staff/staffService'
import { useApiResource } from '../../lib/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

export default function StaffPage() {
  const { data: instructors, loading, error, refetch } = useApiResource(listInstructors)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleAdded = async (name: string) => {
    setShowAddModal(false)
    await refetch()
    showToast(`${name} added to staff`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Staff</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Staff Directory</h1>
        </div>
        <button type="button" onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors">
          <Plus size={15} /> Add Instructor
        </button>
      </div>

      {loading && <LoadingState message="Loading instructors…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(instructors ?? []).map((staff) => <StaffCard key={staff.id} staff={staff} />)}
        </div>
      )}
      {!loading && !error && instructors?.length === 0 && (
        <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No instructors yet. Add one to get started.
        </div>
      )}

      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} onAdded={handleAdded} />}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">{toast}</div>}
    </div>
  )
}
