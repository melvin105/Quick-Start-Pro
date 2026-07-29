import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { formatAuditTimestamp } from './utils'
import { studentProfilePath } from '../students/shared/utils'
import { paymentReceiptPath } from '../payments/utils'
import type { AuditEntry } from './types'

interface AuditDetailDrawerProps {
  entry:   AuditEntry
  onClose: () => void
}

export default function AuditDetailDrawer({ entry, onClose }: AuditDetailDrawerProps) {
  const navigate = useNavigate()
  const { detail } = entry

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-modal flex flex-col">
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200 shrink-0">
          <p className="text-[14px] font-semibold text-gray-900">Audit Detail</p>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="divide-y divide-gray-100">
            <div className="flex justify-between gap-3 py-2">
              <span className="text-[12.5px] text-gray-500">Timestamp</span>
              <span className="text-[13px] text-gray-900 text-right">{formatAuditTimestamp(entry.timestamp)}</span>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <span className="text-[12.5px] text-gray-500">User</span>
              <span className="text-[13px] text-gray-900 text-right">{entry.user}</span>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <span className="text-[12.5px] text-gray-500">Role</span>
              <span className="text-[13px] text-gray-900 text-right">{entry.role}</span>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <span className="text-[12.5px] text-gray-500">Action</span>
              <span className="text-[13px] text-gray-900 text-right">{entry.action}</span>
            </div>
            {detail?.record && (
              <div className="flex justify-between gap-3 py-2">
                <span className="text-[12.5px] text-gray-500">Record</span>
                <span className="text-[13px] text-gray-900 text-right">{detail.record}</span>
              </div>
            )}
          </div>

          {detail?.before && detail.after && (
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Before / After</p>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Field', 'Before', 'After'].map((col) => (
                        <th key={col} className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.before.map((row, i) => (
                      <tr key={row.field} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-2 text-[13px] text-gray-700">{row.field}</td>
                        <td className="px-3 py-2 text-[13px] text-gray-500">{row.value}</td>
                        <td className="px-3 py-2 text-[13px] font-medium text-warning">{detail.after?.[i]?.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {(detail?.linkStudentId || detail?.linkPaymentId) && (
          <div className="p-4 border-t border-gray-200 shrink-0 flex flex-col sm:flex-row gap-2">
            {detail.linkStudentId && (
              <button
                type="button"
                onClick={() => navigate(studentProfilePath(detail.linkStudentId!))}
                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Student Profile
              </button>
            )}
            {detail.linkPaymentId && (
              <button
                type="button"
                onClick={() => navigate(paymentReceiptPath(detail.linkPaymentId!))}
                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
              >
                View Payment History
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
