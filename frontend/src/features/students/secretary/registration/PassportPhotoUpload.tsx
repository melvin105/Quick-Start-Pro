import { useRef, useState } from 'react'
import { UserRound, Camera } from 'lucide-react'

const MAX_SIZE_BYTES = 2 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png']

interface PassportPhotoUploadProps {
  value?: string
  onChange: (dataUrl: string) => void
}

export default function PassportPhotoUpload({ value, onChange }: PassportPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPG or PNG files are accepted.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be 2MB or smaller.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:col-span-2">
      <label className="block text-[13px] font-medium text-gray-800 self-start mb-0.5">Passport Photo</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-[120px] h-[120px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors flex flex-col items-center justify-center gap-1.5 overflow-hidden"
      >
        {value ? (
          <img src={value} alt="Passport preview" className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="relative">
              <UserRound size={28} className="text-gray-400" />
              <Camera size={14} className="absolute -bottom-1 -right-1.5 text-gray-400" />
            </div>
            <span className="text-[11px] text-gray-500">Upload photo</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <p className="text-[11px] text-gray-400">JPG or PNG, up to 2MB — optional</p>
      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  )
}
