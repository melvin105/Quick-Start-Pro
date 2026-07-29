import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import useUsersStore from './usersStore'
import InviteUserModal from './InviteUserModal'
import UserEditModal from './UserEditModal'
import { ROLE_LABELS } from '../../lib/constants'
import type { UserAccount } from './types'

interface UsersTabProps {
  onSaved: (message: string) => void
}

export default function UsersTab({ onSaved }: UsersTabProps) {
  const users = useUsersStore((s) => s.users)
  const inviteUser = useUsersStore((s) => s.inviteUser)
  const updateRole = useUsersStore((s) => s.updateRole)

  const [showInvite, setShowInvite] = useState(false)
  const [editing, setEditing] = useState<UserAccount | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14.5px] font-semibold text-gray-900">Staff Accounts</h2>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <Plus size={15} /> Invite User
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Name', 'Email', 'Role', 'Status', 'Edit'].map((col) => (
                  <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{u.name}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{u.email}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{ROLE_LABELS[u.role]}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                      u.status === 'active' ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
                    }`}>
                      {u.status === 'active' ? 'Active' : 'Locked'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setEditing(u)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      aria-label={`Edit ${u.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInvite && (
        <InviteUserModal
          onClose={() => setShowInvite(false)}
          onInvite={(input) => { inviteUser(input); setShowInvite(false); onSaved(`Invited ${input.name}`) }}
        />
      )}

      {editing && (
        <UserEditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaveRole={(role) => { updateRole(editing.id, role); setEditing(null); onSaved('User updated') }}
          onResetPassword={() => onSaved(`Password reset link sent to ${editing.email}`)}
        />
      )}
    </div>
  )
}
