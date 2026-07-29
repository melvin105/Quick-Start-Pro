import { useState } from 'react'
import { Check } from 'lucide-react'
import BusinessTab from '../../features/settings/BusinessTab'
import PackagesTab from '../../features/settings/PackagesTab'
import UsersTab from '../../features/settings/UsersTab'
import RolesPermissionsTab from '../../features/settings/RolesPermissionsTab'
import NotificationsTab from '../../features/settings/NotificationsTab'
import SecurityTab from '../../features/settings/SecurityTab'

type TabKey = 'business' | 'packages' | 'users' | 'roles' | 'notifications' | 'security'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'business',      label: 'Business' },
  { key: 'packages',      label: 'Packages' },
  { key: 'users',         label: 'Users' },
  { key: 'roles',         label: 'Roles & Permissions' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'security',      label: 'Security' },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>('business')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[12px] text-gray-500">Dashboard / Settings</p>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3.5 py-1.5 text-[13px] font-medium rounded-full whitespace-nowrap transition-colors ${
              tab === t.key ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'business'      && <BusinessTab onSaved={() => showToast('Business settings saved')} />}
      {tab === 'packages'      && <PackagesTab onSaved={() => showToast('Package saved')} />}
      {tab === 'users'         && <UsersTab onSaved={showToast} />}
      {tab === 'roles'         && <RolesPermissionsTab onSaved={() => {}} />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'security'      && <SecurityTab onSaved={showToast} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <Check size={15} className="text-success" />
          {toast}
        </div>
      )}
    </div>
  )
}
