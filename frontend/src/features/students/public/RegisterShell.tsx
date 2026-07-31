import type { ReactNode } from 'react'
import logo from '../../../assets/Logo.svg'

export default function RegisterShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="flex flex-col items-center gap-2 px-6 pt-10 pb-6"
        style={{ background: 'linear-gradient(155deg, #12294F, #1B3A6B)' }}
      >
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
          <img src={logo} alt="" className="w-8 h-8" />
        </div>
        <span className="text-white text-[15px] font-semibold">Quick Start Driving School</span>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
