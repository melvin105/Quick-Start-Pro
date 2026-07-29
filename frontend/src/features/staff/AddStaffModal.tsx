import { useState } from 'react'
import { X } from 'lucide-react'
import useStaffStore from './store'
import useUsersStore from '../settings/usersStore'
import type { StaffRole } from './types'

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: 'secretary',  label: 'Secretary' },
  { value: 'instructor', label: 'Driving Instructor' },
]

interface AddStaffModalProps {
  onClose:  () => void
  onAdded:  (name: string) => void
}

export default function AddStaffModal({ onClose, onAdded }: AddStaffModalProps) {
  const addStaff = useStaffStore((s) => s.addStaff)
  const inviteUser = useUsersStore((s) => s.inviteUser)

  const [name, setName] = useState('')
  const [role, setRole] = useState<StaffRole>('secretary')
  const [phone, setPhone] = useState('')
  const [createLogin, setCreateLogin] = useState(false)
  const [email, setEmail] = useState('')

  const canSubmit = name.trim() !== '' && phone.trim() !== '' && (!createLogin || email.trim() !== '')

  const handleSubmit = () => {
    if (!canSubmit) return
    const member = addStaff({ name: name.trim(), role, phone: phone.trim(), email: createLogin ? email.trim() : undefined })
    if (createLogin) {
      inviteUser({ name: member.name, email: email.trim(), role: role === 'instructor' ? 'instructor' : 'secretary' })
    }
    onAdded(member.name)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">Add Staff</h2>
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
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Role *</label>
          <div className="flex gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-medium border-2 transition-colors ${
                  role === opt.value ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 024 111 2233"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={createLogin}
            onChange={(e) => setCreateLogin(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600/20"
          />
          <span className="text-[13px] text-gray-800">Create system login?</span>
        </label>

        {createLogin && (
          <div>
            <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@quickstartpro.gh"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
            />
          </div>
        )}

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
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Add Staff Member
          </button>
        </div>
      </div>
    </div>
  )
}
