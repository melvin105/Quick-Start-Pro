import { useState } from 'react'
import useUsersStore from './usersStore'

function formatLockDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
}

interface SecurityTabProps {
  onSaved: (message: string) => void
}

export default function SecurityTab({ onSaved }: SecurityTabProps) {
  const users = useUsersStore((s) => s.users)
  const unlockUser = useUsersStore((s) => s.unlockUser)

  const [timeoutMinutes, setTimeoutMinutes] = useState('30')
  const [requireMinLength, setRequireMinLength] = useState(true)
  const [requireNumber, setRequireNumber] = useState(true)
  const [requireRotation, setRequireRotation] = useState(true)

  const lockedUsers = users.filter((u) => u.status === 'locked')

  const handleUnlock = (id: string, name: string) => {
    unlockUser(id)
    onSaved(`${name}'s account unlocked`)
  }

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-[14.5px] font-semibold text-gray-900">Session Timeout</h2>
        <p className="text-[12.5px] text-gray-500">Users are automatically signed out after this period.</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={5}
            value={timeoutMinutes}
            onChange={(e) => setTimeoutMinutes(e.target.value)}
            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
          <span className="text-[13px] text-gray-600">minutes</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-[14.5px] font-semibold text-gray-900">Password Policy</h2>
        <p className="text-[12.5px] text-gray-500">Applies to all new passwords.</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={requireMinLength} onChange={(e) => setRequireMinLength(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600/20" />
          <span className="text-[13px] text-gray-800">Minimum 8 characters</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={requireNumber} onChange={(e) => setRequireNumber(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600/20" />
          <span className="text-[13px] text-gray-800">Require 1 number</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={requireRotation} onChange={(e) => setRequireRotation(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600/20" />
          <span className="text-[13px] text-gray-800">Require every 90 days</span>
        </label>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-[14.5px] font-semibold text-gray-900">Locked Accounts</h2>
        {lockedUsers.length === 0 ? (
          <p className="text-[12.5px] text-gray-400">No locked accounts.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {lockedUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-danger-bg/40 border border-danger/20 rounded-lg flex-wrap">
                <p className="text-[13px] text-gray-800">
                  <span className="font-medium">{u.name}</span>
                  {' — '}
                  {u.failedAttempts ?? 0} failed login attempt{(u.failedAttempts ?? 0) === 1 ? '' : 's'}
                  {u.lastFailedAttempt ? ` — ${formatLockDate(u.lastFailedAttempt)}` : ''}
                </p>
                <button
                  type="button"
                  onClick={() => handleUnlock(u.id, u.name)}
                  className="px-3 py-1.5 text-[12.5px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shrink-0"
                >
                  Unlock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSaved('Security settings saved')}
        className="self-end px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
      >
        Save Changes
      </button>
    </div>
  )
}
