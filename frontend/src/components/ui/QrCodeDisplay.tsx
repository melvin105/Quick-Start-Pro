import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Printer, Maximize } from 'lucide-react'
import logo from '../../assets/Logo.svg'

interface QrCodeDisplayProps {
  value: string
  size?: number
  caption?: string
  showControls?: boolean
  // Tighter padding and no school name/logo row, for contexts like a small
  // modal where the full-size presentation (e.g. RegisterQrPage) is too much.
  compact?: boolean
}

const NAVY = '#1B3A6B'

export default function QrCodeDisplay({ value, size = 240, caption, showControls = false, compact = false }: QrCodeDisplayProps) {
  const [fullscreen, setFullscreen] = useState(false)

  if (fullscreen) {
    return (
      <div
        onClick={() => setFullscreen(false)}
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 cursor-pointer"
        style={{ background: `linear-gradient(155deg, #12294F 0%, ${NAVY} 100%)` }}
      >
        <div className="w-64 h-64 sm:w-80 sm:h-80 bg-white rounded-2xl flex items-center justify-center p-6">
          <QRCode value={value} size={256} bgColor="#FFFFFF" fgColor={NAVY} style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="text-center px-6">
          <p className="text-white text-lg font-semibold">Quick Start Driving School</p>
          <p className="text-white/60 text-[13px] mt-1">Tap anywhere to exit</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className={`print-area flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl w-full ${compact ? 'gap-1.5 py-3 px-3' : 'gap-2 py-8 px-6'}`}>
        {!compact && (
          <div className="flex items-center gap-1.5 mb-1">
            <img src={logo} alt="" className="w-5 h-5" />
            <span className="text-[12px] font-semibold text-gray-700">Quick Start Driving School</span>
          </div>
        )}
        <div className={compact ? 'bg-white p-1.5 rounded-lg border border-gray-200' : 'bg-white p-3 rounded-lg border border-gray-200'}>
          <QRCode value={value} size={size} bgColor="#FFFFFF" fgColor={NAVY} />
        </div>
        {caption && <p className="text-[12px] text-gray-500 mt-1 text-center break-all">{caption}</p>}
      </div>

      {showControls && (
        <div className="flex gap-2 w-full print:hidden">
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
      )}
    </div>
  )
}
