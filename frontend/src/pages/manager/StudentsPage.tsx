import { useState } from 'react'
import { Search, Filter, IdCard } from 'lucide-react'
import ManagerStudentsTable from '../../features/students/manager/ManagerStudentsTable'
import StudentCardList from '../../features/students/shared/StudentCardList'
import ManagerLicencesTable from '../../features/students/manager/ManagerLicencesTable'
import ManagerPendingList from '../../features/students/manager/ManagerPendingList'
import FilterDropdown from '../../features/students/shared/FilterDropdown'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'
import Pagination from '../../components/ui/Pagination'
import { listStudents, listLicences, type ApiStudentStatus } from '../../features/students/shared/studentService'
import { toStudentListItem, enrolmentEnum } from '../../features/students/shared/studentMappers'
import { toLicenceListItem } from '../../features/students/shared/licenceMappers'
import { getPendingRegistrations } from '../../features/registrations/registrationService'
import { toPendingItem } from '../../features/registrations/registrationMappers'
import { useApiResource } from '../../lib/useApiResource'
import { useDebouncedValue } from '../../lib/useDebouncedValue'

type TabKey = 'active' | 'pending' | 'licences' | 'archived'
const PAGE_SIZE = 20

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
  const [tab, setTab] = useState<TabKey>('active')
  const [search, setSearch] = useState('')
  const [enrolmentFilter, setEnrolmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 300)
  const statusParam: ApiStudentStatus | undefined =
    statusFilter === 'active' || statusFilter === 'completed' ? statusFilter : undefined
  const enrolmentParam = enrolmentEnum(enrolmentFilter)

  const { data, loading, error, refetch } = useApiResource(
    () => listStudents({
      search:        debouncedSearch.trim() || undefined,
      status:        statusParam,
      enrolmentType: enrolmentParam,
      outstandingOnly: statusFilter === 'outstanding' || undefined,
      page,
      limit:         PAGE_SIZE,
    }),
    [debouncedSearch, statusParam, enrolmentParam, statusFilter, page],
    {
      cacheKey: `students:${debouncedSearch.trim()}:${statusParam ?? ''}:${enrolmentParam ?? ''}:${statusFilter === 'outstanding'}:${page}`,
      staleTime: 30_000,
    },
  )

  const students = (data?.students ?? []).map(toStudentListItem)

  // Pending self-registration queue (live). The manager view is oversight-only —
  // the secretary approves/rejects from their Students screen.
  const {
    data: registrations,
    loading: pendingLoading,
    error: pendingError,
    refetch: refetchPending,
  } = useApiResource(
    getPendingRegistrations,
    [],
    {
      enabled: tab === 'pending',
      cacheKey: 'registrations:pending',
      staleTime: 30_000,
    },
  )
  const pendingItems = (registrations ?? []).map(toPendingItem)

  // Licence pipeline (live). v_licence_pipeline is already scoped to
  // licence-enrolled students, so no client-side "exclude Driving Only" filter.
  const {
    data: licences,
    loading: licencesLoading,
    error: licencesError,
    refetch: refetchLicences,
  } = useApiResource(
    listLicences,
    [],
    {
      enabled: tab === 'licences',
      cacheKey: 'students:licences',
      staleTime: 30_000,
    },
  )
  const licenceItems = (licences ?? []).map(toLicenceListItem)

  const tabs: { key: TabKey; label: string; count?: number; tone?: 'default' | 'warning'; icon?: typeof IdCard }[] = [
    { key: 'active',    label: 'Active',    count: data?.total },
    { key: 'pending',   label: 'Pending',   count: registrations?.length, tone: 'warning' },
    { key: 'licences',  label: 'Licences',  count: licences?.length, icon: IdCard },
    { key: 'archived',  label: 'Archived' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">Dashboard / Students</p>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Students</h1>
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
            {t.icon && <t.icon size={14} />}
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
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-2 text-[13.5px] bg-white border border-gray-200 rounded-lg placeholder:text-gray-500
                  focus:outline-none focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/10 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((p) => !p)}
              className="sm:hidden flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg"
            >
              <Filter size={14} />
              Filter
            </button>
            <div
              className={`${mobileFiltersOpen ? 'flex flex-col items-stretch' : 'hidden'} gap-2 sm:flex sm:flex-row sm:items-center`}
            >
              <FilterDropdown
                label="Enrolment"
                value={enrolmentFilter}
                options={ENROLMENT_OPTIONS}
                onChange={(value) => { setEnrolmentFilter(value); setPage(1) }}
              />
              <FilterDropdown
                label="Status"
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={(value) => { setStatusFilter(value); setPage(1) }}
              />
            </div>
          </div>

          {loading ? (
            <LoadingState message="Loading students…" />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : (
            <>
              <ManagerStudentsTable students={students} />
              <StudentCardList students={students} />
              <Pagination
                page={data?.page ?? page}
                pageSize={data?.limit ?? PAGE_SIZE}
                total={data?.total ?? 0}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}

      {tab === 'pending' && (
        pendingLoading ? (
          <LoadingState message="Loading submissions…" />
        ) : pendingError ? (
          <ErrorState error={pendingError} onRetry={refetchPending} />
        ) : (
          <ManagerPendingList items={pendingItems} />
        )
      )}

      {tab === 'licences' && (
        licencesLoading ? (
          <LoadingState message="Loading licences…" />
        ) : licencesError ? (
          <ErrorState error={licencesError} onRetry={refetchLicences} />
        ) : (
          <ManagerLicencesTable students={licenceItems} />
        )
      )}

      {tab === 'archived' && (
        <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          Archived students will appear here.
        </div>
      )}
    </div>
  )
}
