import { useState } from 'react'
import { Plus } from 'lucide-react'
import useStaffStore from '../../features/staff/store'
import StaffCard from '../../features/staff/StaffCard'
import AddStaffModal from '../../features/staff/AddStaffModal'

export default function StaffPage() {
  const staff = useStaffStore((s) => s.staff)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleAdded = (name: string) => {
    setShowAddModal(false)
    setToast(`${name} added to staff`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Staff</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Staff Directory</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <Plus size={15} /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => <StaffCard key={s.id} staff={s} />)}
      </div>

      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} onAdded={handleAdded} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          {toast}
        </div>
      )}
    </div>
  )
}
