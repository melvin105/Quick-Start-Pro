import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Check, RotateCcw } from 'lucide-react'
import StatCards from '../../features/payments/StatCards'
import PaymentsTable from '../../features/payments/PaymentsTable'
import PaymentsCardList from '../../features/payments/PaymentsCardList'
import Dropdown from '../../features/payments/Dropdown'
import RecordPaymentModal from '../../features/payments/RecordPaymentModal'
import PaymentDetailDrawer from '../../features/payments/PaymentDetailDrawer'
import DatePicker from '../../components/ui/DatePicker'
import PageDataSkeleton from '../../components/ui/PageDataSkeleton'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import { useApiResource } from '../../lib/useApiResource'
import { listPayments } from '../../features/payments/paymentService'
import { paymentMethodValue, toPaymentRecord } from '../../features/payments/paymentMappers'
import { listStudents } from '../../features/students/shared/studentService'
import { todayIso } from '../../features/payments/utils'
import type { PaymentMethod, PaymentRecord } from '../../features/payments/types'
import type { ApiPaymentStatus } from '../../features/payments/paymentService'

const PAGE_SIZE = 20

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
  // Arriving from a student profile's "+ Record Payment" link pre-fills and
  // opens the modal directly, instead of landing here with no context and
  // making the secretary search for the student a second time.
  const [searchParams, setSearchParams] = useSearchParams()
  const initialStudentId = searchParams.get('studentId') ?? undefined

  const [showRecordModal, setShowRecordModal] = useState(!!initialStudentId)
  const [detailRecord, setDetailRecord] = useState<PaymentRecord | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [dateFilter, setDateFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, loading, error, refetch } = useApiResource(
    () => listPayments({
      dateFrom: dateFilter || undefined,
      dateTo: dateFilter || undefined,
      method: methodFilter ? paymentMethodValue(methodFilter as PaymentMethod) : undefined,
      status: (statusFilter || undefined) as ApiPaymentStatus | undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [dateFilter, methodFilter, statusFilter, page],
    {
      cacheKey: `payments:${dateFilter}:${methodFilter}:${statusFilter}:${page}`,
      staleTime: 30_000,
    },
  )
  const studentResource = useApiResource(
    () => listStudents({ limit: 100 }),
    [],
    {
      enabled: showRecordModal,
      cacheKey: 'students:::',
      staleTime: 30_000,
    },
  )

  const records = useMemo(() => data?.payments.map(toPaymentRecord) ?? [], [data])
  const students = useMemo(() => studentResource.data?.students ?? [], [studentResource.data])

  const hasActiveFilters = dateFilter !== '' || methodFilter !== '' || statusFilter !== ''

  const resetFilters = () => {
    setDateFilter('')
    setMethodFilter('')
    setStatusFilter('')
    setPage(1)
  }

  const stats = useMemo(() => {
    const apiStats = data?.stats
    return {
      todayIncome:         apiStats?.today_income ?? 0,
      monthIncome:         apiStats?.month_income ?? 0,
      outstanding:         apiStats?.outstanding ?? 0,
      studentsWithBalance: apiStats?.students_with_balance ?? 0,
    }
  }, [data])

  const closeRecordModal = () => {
    setShowRecordModal(false)
    if (initialStudentId) setSearchParams({}, { replace: true })
  }

  const handleRecorded = async (record: { receiptNo: string }) => {
    await Promise.all([refetch(), studentResource.refetch()])
    closeRecordModal()
    setToast(`Payment recorded — receipt ${record.receiptNo}`)
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) return <PageDataSkeleton title="Payments" panels={1} />
  if (error) return <ErrorState error={error} onRetry={refetch} />

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
        <DatePicker value={dateFilter} onChange={(value) => { setDateFilter(value); setPage(1) }} maxDate={todayIso()} />
        <Dropdown
          label="Payment Method"
          value={methodFilter}
          options={METHOD_OPTIONS}
          onChange={(value) => { setMethodFilter(value); setPage(1) }}
        />
        <Dropdown
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(value) => { setStatusFilter(value); setPage(1) }}
        />
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

      <PaymentsTable records={records} onView={setDetailRecord} />
      <PaymentsCardList records={records} onView={setDetailRecord} />
      <Pagination
        page={data?.page ?? page}
        pageSize={data?.limit ?? PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />

      {/* Mobile: pinned bottom Record Payment button */}
      <button
        type="button"
        onClick={() => setShowRecordModal(true)}
        className="sm:hidden fixed bottom-4 left-4 right-4 z-30 flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[14px] rounded-xl shadow-modal transition-colors"
      >
        <Plus size={16} /> Record Payment
      </button>

      {showRecordModal && (
        <RecordPaymentModal
          onClose={closeRecordModal}
          onRecorded={handleRecorded}
          students={students}
          studentsLoading={studentResource.loading}
          studentsError={studentResource.error?.message}
          onRetryStudents={studentResource.refetch}
          initialStudentId={initialStudentId}
        />
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
