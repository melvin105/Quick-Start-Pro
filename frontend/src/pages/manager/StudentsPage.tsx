import { useMemo, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import useStudentsStore from '../../features/students/shared/store'
import ManagerStudentsTable from '../../features/students/manager/ManagerStudentsTable'
import StudentCardList from '../../features/students/shared/StudentCardList'
import ManagerLicencesTable from '../../features/students/manager/ManagerLicencesTable'
import ManagerPendingList from '../../features/students/manager/ManagerPendingList'
import FilterDropdown from '../../features/students/shared/FilterDropdown'

type TabKey = 'active' | 'pending' | 'licences' | 'archived'

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
  const students = useStudentsStore((s) => s.students)
  const pending = useStudentsStore((s) => s.pending)

  const [tab, setTab] = useState<TabKey>('active')
  const [search, setSearch] = useState('')
  const [enrolmentFilter, setEnrolmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return students.filter((s) => {
      const matchesSearch = query === '' || s.name.toLowerCase().includes(query) || s.phone.includes(query)
      const matchesEnrolment = !enrolmentFilter || s.enrolment === enrolmentFilter
      const matchesStatus = !statusFilter || s.status === statusFilter
      return matchesSearch && matchesEnrolment && matchesStatus
    })
  }, [students, search, enrolmentFilter, statusFilter])

  const licenceEligible = useMemo(
    () => students.filter((s) => s.enrolment !== 'Driving Only'),
    [students],
  )

  const tabs: { key: TabKey; label: string; count?: number; tone?: 'default' | 'warning' }[] = [
    { key: 'active',    label: 'Active',    count: students.length },
    { key: 'pending',   label: 'Pending',   count: pending.length, tone: 'warning' },
    { key: 'licences',  label: 'Licences',  count: licenceEligible.length },
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
              <FilterDropdown label="Enrolment" value={enrolmentFilter} options={ENROLMENT_OPTIONS} onChange={setEnrolmentFilter} />
              <FilterDropdown label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
            </div>
          </div>

          <ManagerStudentsTable students={filteredStudents} />
          <StudentCardList students={filteredStudents} />

          <p className="text-[12.5px] text-gray-500">
            Showing {filteredStudents.length} student{filteredStudents.length === 1 ? '' : 's'}
          </p>
        </>
      )}

      {tab === 'pending' && <ManagerPendingList items={pending} />}

      {tab === 'licences' && <ManagerLicencesTable students={licenceEligible} />}

      {tab === 'archived' && (
        <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
          Archived students will appear here.
        </div>
      )}
    </div>
  )
}
