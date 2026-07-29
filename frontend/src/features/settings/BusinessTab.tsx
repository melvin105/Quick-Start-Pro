import { useState } from 'react'

interface BusinessTabProps {
  onSaved: () => void
}

export default function BusinessTab({ onSaved }: BusinessTabProps) {
  const [schoolName, setSchoolName] = useState('Quick Start Driving School')
  const [address, setAddress] = useState('Ayeduase Gate, Kumasi')
  const [phone, setPhone] = useState('030 222 4455')

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 max-w-xl flex flex-col gap-4">
      <div>
        <label className="block text-[13px] font-medium text-gray-800 mb-1.5">School Name</label>
        <input
          type="text"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Business Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
        />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-gray-800 mb-1.5">Contact Phone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
        />
      </div>
      <button
        type="button"
        onClick={onSaved}
        className="self-end px-4 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
      >
        Save Changes
      </button>
    </div>
  )
}
