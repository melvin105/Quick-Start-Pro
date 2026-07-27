import { useMemo, useState } from 'react'
import { Plus, Check, RotateCcw } from 'lucide-react'
import usePaymentsStore from '../../features/payments/store'
import useStudentsStore from '../../features/students/shared/store'
import StatCards from '../../features/payments/StatCards'
import PaymentsTable from '../../features/payments/PaymentsTable'
import PaymentsCardList from '../../features/payments/PaymentsCardList'
import Dropdown from '../../features/payments/Dropdown'
import RecordPaymentModal from '../../features/payments/RecordPaymentModal'
import PaymentDetailDrawer from '../../features/payments/PaymentDetailDrawer'
import { todayIso } from '../../features/payments/utils'
import type { PaymentRecord } from '../../features/payments/types'

const RANGE_OPTIONS = [
  { value: '',    label: 'Date Range' },
  { value: '7',   label: 'Last 7 days' },
  { value: '30',  label: 'Last 30 days' },
]

const METHOD_OPTIONS = [
  { value: '', label: 'Payment Method' },
  { value: 'Cash', label: 'Cash' },
  { value: 'MoMo', label: 'MoMo' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Status' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
]

export default function PaymentsPage() {
  const records = usePaymentsStore((s) => s.records)
  const students = useStudentsStore((s) => s.students)

  const [showRecordModal, setShowRecordModal] = useState(false)
  const [detailRecord, setDetailRecord] = useState<PaymentRecord | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [range, setRange] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const hasActiveFilters = range !== '' || methodFilter !== '' || statusFilter !== ''

  const resetFilters = () => {
    setRange('')
    setMethodFilter('')
    setStatusFilter('')
  }

  const filtered = useMemo(() => {
    const cutoff = range === '' ? null : (() => {
      const d = new Date()
      d.setDate(d.getDate() - Number(range))
      return d
    })()
    return records
      .filter((r) => {
        if (cutoff && new Date(r.date) < cutoff) return false
        if (methodFilter && r.method !== methodFilter) return false
        if (statusFilter && r.status !== statusFilter) return false
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
  }, [records, range, methodFilter, statusFilter])

  const stats = useMemo(() => {
    const today = todayIso()
    const month = today.slice(0, 7)
    const todayIncome = records.filter((r) => r.date === today).reduce((sum, r) => sum + r.amount, 0)
    const monthIncome = records.filter((r) => r.date.slice(0, 7) === month).reduce((sum, r) => sum + r.amount, 0)
    const outstanding = students.reduce((sum, s) => sum + s.balance, 0)
    const studentsWithBalance = students.filter((s) => s.balance > 0).length
    return { todayIncome, monthIncome, outstanding, studentsWithBalance }
  }, [records, students])

  const handleRecorded = (record: PaymentRecord) => {
    setShowRecordModal(false)
    setToast(`Payment recorded — receipt ${record.id}`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[12px] text-gray-500">Dashboard / Payments</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Payments</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowRecordModal(true)}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
        >
          <Plus size={15} /> Record Payment
        </button>
      </div>

      <StatCards {...stats} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12.5px] text-gray-500 font-medium">Filter:</span>
        <Dropdown label="Date Range" value={range} options={RANGE_OPTIONS} onChange={setRange} />
        <Dropdown label="Payment Method" value={methodFilter} options={METHOD_OPTIONS} onChange={setMethodFilter} />
        <Dropdown label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-gray-500 hover:text-brand-600 transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      <PaymentsTable records={filtered} onView={setDetailRecord} />
      <PaymentsCardList records={filtered} onView={setDetailRecord} />

      {/* Mobile: pinned bottom Record Payment button */}
      <button
        type="button"
        onClick={() => setShowRecordModal(true)}
        className="sm:hidden fixed bottom-4 left-4 right-4 z-30 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[14px] rounded-xl shadow-modal transition-colors"
      >
        <Plus size={16} /> Record Payment
      </button>

      {showRecordModal && (
        <RecordPaymentModal onClose={() => setShowRecordModal(false)} onRecorded={handleRecorded} />
      )}

      {detailRecord && (
        <PaymentDetailDrawer record={detailRecord} onClose={() => setDetailRecord(null)} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white text-[13px] font-medium rounded-lg shadow-modal">
          <Check size={15} className="text-success" />
          {toast}
        </div>
      )}
    </div>
  )
}
