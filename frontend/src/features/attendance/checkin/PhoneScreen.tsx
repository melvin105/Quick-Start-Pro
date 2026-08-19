import { useState } from 'react'

interface PhoneScreenProps {
  onSubmit: (phone: string) => void
  loading?: boolean
}

export default function PhoneScreen({ onSubmit, loading = false }: PhoneScreenProps) {
  const [phone, setPhone] = useState('')

  return (
    <>
      <h1 className="text-[18px] font-semibold text-gray-900">Mark yourself present for today's lesson</h1>
      <input
        type="tel"
        inputMode="numeric"
        autoFocus
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter your phone number"
        className="w-full px-4 py-3.5 text-[16px] text-center border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
      />
      <button
        type="button"
        disabled={!phone.trim() || loading}
        onClick={() => onSubmit(phone)}
        className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[15px] rounded-xl transition-colors"
      >
        {loading ? 'Looking up…' : 'Check In →'}
      </button>
    </>
  )
}
