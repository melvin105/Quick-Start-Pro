import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Printer, Copy, Check, ArrowLeft } from 'lucide-react'
import { createRegistrationInvitation } from '../../features/registrations/registrationService'
import { APP_URL, ROUTES } from '../../lib/constants'
import { useApiResource } from '../../lib/useApiResource'
import QrCodeDisplay from '../../components/ui/QrCodeDisplay'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

interface LocationState {
  phone?: string
}

export default function RegisterQrPage() {
  const location = useLocation()
  const [copied, setCopied] = useState(false)

  const phone = (location.state as LocationState | null)?.phone ?? ''
  const { data: invitation, loading, error: invitationError, refetch } = useApiResource(
    () => createRegistrationInvitation(phone || undefined),
    [phone],
  )
  const link = invitation ? `${APP_URL}${ROUTES.REGISTER}/${encodeURIComponent(invitation.token)}` : ''

  const handleCopy = async () => {
    try {
      if (!link) return
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can fail (permissions, insecure context) — non-critical, ignore.
    }
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

        {loading && <LoadingState message="Generating secure link…" className="py-10" />}
        {invitationError && <ErrorState error={invitationError} onRetry={refetch} className="py-8" />}
        {invitation && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <QrCodeDisplay value={link} caption={link} />
            <p className="text-[11.5px] text-gray-400 text-center mt-2">Expires in 24 hours</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!invitation}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Printer size={15} /> Print QR Code
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!invitation}
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
      </div>
    </div>
  )
}
