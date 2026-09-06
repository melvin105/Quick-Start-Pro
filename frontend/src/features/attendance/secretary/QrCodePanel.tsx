import { X } from 'lucide-react'
import QrCodeDisplay from '../../../components/ui/QrCodeDisplay'
import { APP_URL, ROUTES } from '../../../lib/constants'
import { formatTodayLong } from '../shared/utils'

interface QrCodePanelProps {
  onClose: () => void
}

// A static, permanent link — no token to mint, so nothing to load.
const LINK = `${APP_URL}${ROUTES.CHECK_IN}`

export default function QrCodePanel({ onClose }: QrCodePanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 print:hidden" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-xs w-full p-4">
        <div className="flex items-start justify-between mb-1 print:hidden">
          <div>
            <h2 className="text-[14.5px] font-semibold text-gray-900">Attendance Check-In</h2>
            <p className="text-[12px] text-gray-500">{formatTodayLong()}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <QrCodeDisplay value={LINK} caption={LINK} size={140} compact showControls />
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-3 print:hidden">
          Students scan this to mark themselves present.
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
