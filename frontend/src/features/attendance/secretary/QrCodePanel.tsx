import { X } from 'lucide-react'
import QrCodeDisplay from '../../../components/ui/QrCodeDisplay'
import { APP_URL, ROUTES } from '../../../lib/constants'
import { formatTodayLong } from '../shared/utils'
import { createDailyCheckinToken } from '../checkin/checkinService'
import { useApiResource } from '../../../lib/useApiResource'
import LoadingState from '../../../components/ui/LoadingState'
import ErrorState from '../../../components/ui/ErrorState'

interface QrCodePanelProps {
  onClose: () => void
}

export default function QrCodePanel({ onClose }: QrCodePanelProps) {
  const { data, loading, error, refetch } = useApiResource(createDailyCheckinToken)
  const link = data ? `${APP_URL}${ROUTES.CHECK_IN}?token=${encodeURIComponent(data.token)}` : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 print:hidden" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-modal max-w-sm w-full p-5">
        <div className="flex items-start justify-between mb-1 print:hidden">
          <div>
            <h2 className="text-[14.5px] font-semibold text-gray-900">Attendance Check-In</h2>
            <p className="text-[12px] text-gray-500">{formatTodayLong()}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          {loading && <LoadingState message="Generating today's code…" className="py-10" />}
          {error && <ErrorState error={error} onRetry={refetch} className="py-8" />}
          {data && <QrCodeDisplay value={link} caption={`${APP_URL}${ROUTES.CHECK_IN}`} showControls />}
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-3 print:hidden">
          Students scan this to mark themselves present. This code expires at the end of today.
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
