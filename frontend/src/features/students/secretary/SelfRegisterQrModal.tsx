import { X } from 'lucide-react'
import { createRegistrationInvitation } from '../../registrations/registrationService'
import { APP_URL, ROUTES } from '../../../lib/constants'
import { useApiResource } from '../../../lib/useApiResource'
import QrCodeDisplay from '../../../components/ui/QrCodeDisplay'
import LoadingState from '../../../components/ui/LoadingState'
import ErrorState from '../../../components/ui/ErrorState'

interface SelfRegisterQrModalProps {
  onClose: () => void
}

export default function SelfRegisterQrModal({ onClose }: SelfRegisterQrModalProps) {
  // Mint a registration token so the QR points at /register/<token>. A tokenless
  // /register link is rejected by RegisterPage ("Registration link required") and
  // the backend submit (assertRegistrationToken). No phone is bound here, so a
  // single shared token serves every walk-in for the 24h window — they all land
  // in the Pending tab for staff to review. Reprint the poster daily as it expires.
  const { data: invitation, loading, error, refetch } = useApiResource(
    () => createRegistrationInvitation(),
    [],
  )
  const link = invitation ? `${APP_URL}${ROUTES.REGISTER}/${encodeURIComponent(invitation.token)}` : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 print:hidden" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5">
        <div className="flex items-start justify-between mb-1 print:hidden">
          <div>
            <h2 className="text-[14.5px] font-semibold text-gray-900">Student Self-Registration</h2>
            <p className="text-[12px] text-gray-500">Print and display for walk-ins</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          {loading && <LoadingState message="Generating secure link…" className="py-10" />}
          {error && <ErrorState error={error} onRetry={refetch} className="py-8" />}
          {invitation && <QrCodeDisplay value={link} caption={link} showControls />}
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-3 print:hidden">
          Walk-ins scan this to fill in their own details. Submissions appear in the Pending tab for you to review.
          This link expires in 24 hours — reprint to refresh it.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium rounded-lg transition-colors print:hidden"
        >
          Close
        </button>
      </div>
    </div>
  )
}
