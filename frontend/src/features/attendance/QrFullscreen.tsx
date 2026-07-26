import { QrCode } from 'lucide-react'

export default function QrFullscreen({ onExit }: { onExit: () => void }) {
  return (
    <div
      onClick={onExit}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 cursor-pointer"
      style={{ background: 'linear-gradient(155deg, #12294F 0%, #1B3A6B 100%)' }}
    >
      <div className="w-64 h-64 sm:w-80 sm:h-80 bg-white rounded-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-300">
          <QrCode size={72} />
          <span className="text-[13px] font-semibold tracking-wide text-gray-400">QR CODE</span>
        </div>
      </div>
      <div className="text-center px-6">
        <p className="text-white text-lg font-semibold">Quick Start Driving School</p>
        <p className="text-white/60 text-[13px] mt-1">Scan to check in for today's lesson — tap anywhere to exit</p>
      </div>
    </div>
  )
}
