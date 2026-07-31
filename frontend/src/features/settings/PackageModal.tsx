import { useState } from 'react'
import { X } from 'lucide-react'
import type { CoursePackage } from './types'

interface PackageModalProps {
  editing?: CoursePackage
  onClose:  () => void
  onSave:   (input: { name: string; price: number }) => void
}

export default function PackageModal({ editing, onClose, onSave }: PackageModalProps) {
  const [name, setName] = useState(editing?.name ?? '')
  const [price, setPrice] = useState(String(editing?.price ?? ''))

  const canSave = name.trim() !== '' && Number(price) > 0

  const handleSave = () => {
    if (!canSave) return
    onSave({ name: name.trim(), price: Number(price) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">{editing ? 'Edit Package' : 'Add Package'}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Driving Only"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Price (GHS)</label>
          <input
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
        </div>

        <div className="flex justify-end gap-2 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {editing ? 'Save Changes' : 'Add Package'}
          </button>
        </div>
      </div>
    </div>
  )
}
