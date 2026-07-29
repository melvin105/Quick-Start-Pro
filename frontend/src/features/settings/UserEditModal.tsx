import { useState } from 'react'
import { X, KeyRound } from 'lucide-react'
import type { Role } from '../../lib/constants'
import type { UserAccount } from './types'

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'secretary', label: 'Secretary' },
  { value: 'admin',      label: 'Manager' },
]

interface UserEditModalProps {
  user:    UserAccount
  onClose: () => void
  onSaveRole: (role: Role) => void
  onResetPassword: () => void
}

export default function UserEditModal({ user, onClose, onSaveRole, onResetPassword }: UserEditModalProps) {
  const [role, setRole] = useState<Role>(user.role)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-900">Edit {user.name}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Role</label>
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

        <button
          type="button"
          onClick={onResetPassword}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <KeyRound size={14} /> Reset Password
        </button>

        <div className="flex justify-end gap-2 mt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSaveRole(role)}
            className="px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
