import type { ReactNode } from 'react'
import { Car } from 'lucide-react'

export default function CheckInShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-card overflow-hidden">
        <div
          className="flex flex-col items-center gap-2 px-6 pt-10 pb-6"
          style={{ background: 'linear-gradient(155deg, #12294F, #1B3A6B)' }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <Car size={22} className="text-white" />
          </div>
          <span className="text-white text-[15px] font-semibold">Quick Start Driving School</span>
        </div>
        <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
          {children}
        </div>
      </div>
    </div>
  )
}
