import { useState } from 'react'
import { Check } from 'lucide-react'
import PackagesTab from '../../features/settings/PackagesTab'

export default function SettingsPage() {
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
        <p className="text-[13px] text-gray-500 mt-0.5">
          Prices and packages set here apply across the app, including student registration.
        </p>
      </div>

      <PackagesTab onSaved={() => showToast('Package saved')} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <Check size={15} className="text-success" />
          {toast}
        </div>
      )}
    </div>
  )
}
