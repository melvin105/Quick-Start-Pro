import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { QrCode, Plus, Search, Filter, IdCard } from 'lucide-react'
import useStudentsStore from '../../features/students/shared/store'
import StudentsTable from '../../features/students/secretary/StudentsTable'
import StudentCardList from '../../features/students/shared/StudentCardList'
import PendingSubmissions from '../../features/students/secretary/PendingSubmissions'
import FilterDropdown from '../../features/students/shared/FilterDropdown'
import SelfRegisterQrModal from '../../features/students/secretary/SelfRegisterQrModal'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import { listStudents, type ApiStudentStatus } from '../../features/students/shared/studentService'
import { toStudentListItem, enrolmentEnum } from '../../features/students/shared/studentMappers'
import { useApiResource } from '../../lib/useApiResource'
import { useDebouncedValue } from '../../lib/useDebouncedValue'
import { ROUTES } from '../../lib/constants'

type TabKey = 'active' | 'pending' | 'archived'

const ENROLMENT_OPTIONS = [
  { value: '', label: 'Enrolment' },
  { value: 'Driving + Licence', label: 'Driving + Licence' },
  { value: 'Licence Only', label: 'Licence Only' },
  { value: 'Driving Only', label: 'Driving Only' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Status' },
  { value: 'active', label: 'Active' },
  { value: 'outstanding', label: 'Outstanding' },
  { value: 'completed', label: 'Completed' },
]

export default function StudentsPage() {
  const navigate = useNavigate()
  // Pending self-registrations still come from the store until the approval
  // flow is migrated (#124 slice 2); the Active roster is live below.
  const pending = useStudentsStore((s) => s.pending)

  const [tab, setTab] = useState<TabKey>('active')
  const [search, setSearch] = useState('')
  const [enrolmentFilter, setEnrolmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 300)
  // 'outstanding' is derived from balance, not a backend status, so it is
  // refined client-side below; only real statuses go to the server.
  const statusParam: ApiStudentStatus | undefined =
    statusFilter === 'active' || statusFilter === 'completed' ? statusFilter : undefined
  const enrolmentParam = enrolmentEnum(enrolmentFilter)

  const { data, loading, error, refetch } = useApiResource(
    () => listStudents({
      search:        debouncedSearch.trim() || undefined,
      status:        statusParam,
      enrolmentType: enrolmentParam,
      limit:         100,
    }),
    [debouncedSearch, statusParam, enrolmentParam],
  )

  const allItems = (data?.students ?? []).map(toStudentListItem)
  const students = statusFilter === 'outstanding'
    ? allItems.filter((s) => s.status === 'outstanding')
    : allItems

  const tabs: { key: TabKey; label: string; count?: number; tone?: 'default' | 'warning' }[] = [
    { key: 'active',   label: 'Active',   count: data?.total },
    { key: 'pending',  label: 'Pending',  count: pending.length, tone: 'warning' },
    { key: 'archived', label: 'Archived' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">Dashboard / Students</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Students</h1>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.STUDENTS_LICENCES}
              aria-label="Students — Licences"
              title="Students — Licences"
              className="flex items-center justify-center w-9 h-9 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <IdCard size={16} />
            </Link>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
            >
              <QrCode size={15} />
              Show QR Code
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.STUDENTS_REGISTER)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
            >
              <Plus size={15} />
              <span className="sm:hidden">Register</span>
              <span className="hidden sm:inline">Register Student</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((p) => !p)}
              className="sm:hidden flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg"
            >
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-5 border-b border-gray-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 pb-3 text-[13.5px] font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                  t.tone === 'warning' ? 'bg-warning-bg text-warning' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'active' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-2 text-[13.5px] bg-white border border-gray-200 rounded-lg placeholder:text-gray-500
                  focus:outline-none focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/10 transition-colors"
              />
            </div>
            <div
              className={`${mobileFiltersOpen ? 'flex flex-col items-stretch' : 'hidden'} gap-2 sm:flex sm:flex-row sm:items-center`}
            >
              <FilterDropdown label="Enrolment" value={enrolmentFilter} options={ENROLMENT_OPTIONS} onChange={setEnrolmentFilter} />
              <FilterDropdown label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
            </div>
          </div>

          {loading ? (
            <LoadingState message="Loading students…" />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : (
            <>
              <StudentsTable students={students} />
              <StudentCardList students={students} />
              <p className="text-[12.5px] text-gray-500">
                Showing {students.length} of {data?.total ?? students.length} student
                {(data?.total ?? students.length) === 1 ? '' : 's'}
              </p>
            </>
          )}
        </>
      )}

      {tab === 'pending' && <PendingSubmissions items={pending} />}

      {tab === 'archived' && (
        <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          Archived students will appear here.
        </div>
      )}

      {showQrModal && <SelfRegisterQrModal onClose={() => setShowQrModal(false)} />}
    </div>
  )
}
