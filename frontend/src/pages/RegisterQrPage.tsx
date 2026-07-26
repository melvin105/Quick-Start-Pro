import { useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { QrCode, Printer, Copy, Check, ArrowLeft } from 'lucide-react'
import useStudentsStore from '../features/students/store'
import { buildSimulatedSubmission } from '../features/students/mockData'
import { ROUTES } from '../lib/constants'

interface LocationState {
  phone?: string
}

export default function RegisterQrPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const addPending = useStudentsStore((s) => s.addPending)
  const [copied, setCopied] = useState(false)

  const phone = (location.state as LocationState | null)?.phone ?? ''

  const sessionId = useMemo(() => `sess_${Math.random().toString(36).slice(2, 8)}`, [])
  const link = `quickstart.app/register/${sessionId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${link}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can fail (permissions, insecure context) — non-critical, ignore.
    }
  }

  const handleSimulateSubmission = () => {
    const submission = buildSimulatedSubmission(phone || '024 000 0000')
    addPending(submission)
    navigate(ROUTES.STUDENTS)
  }

  return (
    <div className="flex flex-col gap-5 max-w-md">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">Dashboard / Students / Register / QR</p>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Generate QR Code</h1>
          <Link to={ROUTES.STUDENTS_REGISTER} className="text-[13px] text-gray-500 hover:text-gray-800 flex items-center gap-1 shrink-0">
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <h2 className="text-[14.5px] font-semibold text-gray-900">Send QR Code to Student</h2>
          <p className="text-[13px] text-gray-500 mt-1">
            Generate a unique QR code for the student to scan and fill in their own details. You will complete the
            registration once they submit.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl py-8">
          <div className="w-40 h-40 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <QrCode size={40} />
              <span className="text-[11px] font-medium tracking-wide">QR CODE</span>
            </div>
          </div>
          <p className="text-[12.5px] text-gray-600 mt-1">{link}</p>
          <p className="text-[11.5px] text-gray-400">Expires in 24 hours</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Printer size={15} /> Print QR Code
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium rounded-lg transition-colors"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-5 flex flex-col gap-2">
        <p className="text-[13px] font-medium text-gray-800">Waiting for the student to submit…</p>
        <p className="text-[12.5px] text-gray-500">
          Once they scan and complete Steps 1–3 on their phone, their record will appear in the Pending tab on the
          student list for you to finish.
        </p>
        <button
          type="button"
          onClick={handleSimulateSubmission}
          className="mt-2 self-start px-3.5 py-2 text-[12.5px] font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
        >
          Simulate Student Submission (demo)
        </button>
      </div>
    </div>
  )
}
