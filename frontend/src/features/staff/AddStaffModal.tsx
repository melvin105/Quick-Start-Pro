import { useState } from 'react'
import { X } from 'lucide-react'
import { createInstructor } from './staffService'

interface AddStaffModalProps {
  onClose:  () => void
  onAdded:  (name: string) => void
}

export default function AddStaffModal({ onClose, onAdded }: AddStaffModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = name.trim() !== '' && phone.trim() !== ''

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    setError('')
    try {
      const member = await createInstructor({ name: name.trim(), phone: phone.trim() })
      onAdded(member.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add instructor.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">Add Instructor</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Phone *</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 024 111 2233"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
        </div>

        <div className="flex justify-end gap-2 mt-1">
          {error && <p className="mr-auto text-[12px] text-danger">{error}</p>}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit || saving}
            onClick={handleSubmit}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {saving ? 'Adding…' : 'Add Instructor'}
          </button>
        </div>
      </div>
    </div>
  )
}
