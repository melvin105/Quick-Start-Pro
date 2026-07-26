import { useState } from 'react'
import { X, Printer, Maximize, QrCode } from 'lucide-react'
import { checkInPath, formatTodayLong, todayCode } from './utils'
import QrFullscreen from './QrFullscreen'

interface QrCodePanelProps {
  onClose: () => void
}

export default function QrCodePanel({ onClose }: QrCodePanelProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const link = `quickstart.app${checkInPath(todayCode())}`

  if (fullscreen) {
    return <QrFullscreen onExit={() => setFullscreen(false)} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-[14.5px] font-semibold text-gray-900">Today's Check-In Code</h2>
            <p className="text-[12px] text-gray-500">{formatTodayLong()}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl py-8 mt-4">
          <div className="w-44 h-44 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <QrCode size={44} />
              <span className="text-[11px] font-medium tracking-wide">QR CODE</span>
            </div>
          </div>
          <p className="text-[12px] text-gray-500 mt-1">{link}</p>
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-3">
          Students scan this to mark themselves present. Expires at midnight.
        </p>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium rounded-lg transition-colors"
          >
            <Printer size={15} /> Print
          </button>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Maximize size={15} /> Fullscreen
          </button>
        </div>
      </div>
    </div>
  )
}
