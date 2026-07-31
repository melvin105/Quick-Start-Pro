import { X } from 'lucide-react'
import QrCodeDisplay from '../../../components/ui/QrCodeDisplay'
import { APP_URL, ROUTES } from '../../../lib/constants'

interface SelfRegisterQrModalProps {
  onClose: () => void
}

export default function SelfRegisterQrModal({ onClose }: SelfRegisterQrModalProps) {
  const link = `${APP_URL}${ROUTES.REGISTER}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 print:hidden" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5">
        <div className="flex items-start justify-between mb-1 print:hidden">
          <div>
            <h2 className="text-[14.5px] font-semibold text-gray-900">Student Self-Registration</h2>
            <p className="text-[12px] text-gray-500">Print and display for walk-ins</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <QrCodeDisplay value={link} caption={link} showControls />
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-3 print:hidden">
          Walk-ins scan this to fill in their own details. Submissions appear in the Pending tab for you to review.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium rounded-lg transition-colors print:hidden"
        >
          Close
        </button>
      </div>
    </div>
  )
}
