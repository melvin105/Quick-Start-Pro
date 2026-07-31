import { useState } from 'react'
import { Plus, Pencil, Check, X } from 'lucide-react'
import useStaffStore from '../../features/staff/store'
import StaffCard from '../../features/staff/StaffCard'
import AddStaffModal from '../../features/staff/AddStaffModal'

export default function StaffPage() {
  const staff = useStaffStore((s) => s.staff)
  const updateStaff = useStaffStore((s) => s.updateStaff)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const secretary = staff.find((s) => s.role === 'secretary')
  const instructors = staff.filter((s) => s.role === 'instructor')

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(secretary?.name ?? '')

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleAdded = (name: string) => {
    setShowAddModal(false)
    showToast(`${name} added to staff`)
  }

  const startEditingName = () => {
    setNameDraft(secretary?.name ?? '')
    setEditingName(true)
  }

  const saveName = () => {
    if (!secretary || nameDraft.trim() === '') return
    updateStaff(secretary.id, { name: nameDraft.trim() })
    setEditingName(false)
    showToast('Secretary name updated')
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
          <Plus size={15} /> Add Instructor
        </button>
      </div>

      {secretary && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Secretary</p>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
                />
                <button
                  type="button"
                  onClick={saveName}
                  className="p-1.5 rounded-md text-success hover:bg-success-bg transition-colors"
                  aria-label="Save"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
                  aria-label="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <p className="text-[15px] font-medium text-gray-900">{secretary.name}</p>
            )}
            <p className="text-[12px] text-gray-500 mt-1">Shown in the greeting when she signs in as Secretary.</p>
          </div>
          {!editingName && (
            <button
              type="button"
              onClick={startEditingName}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Pencil size={13} /> Edit Name
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructors.map((s) => <StaffCard key={s.id} staff={s} />)}
      </div>

      {instructors.length === 0 && (
        <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          No instructors yet. Add one to get started.
        </div>
      )}

      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} onAdded={handleAdded} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          {toast}
        </div>
      )}
    </div>
  )
}
