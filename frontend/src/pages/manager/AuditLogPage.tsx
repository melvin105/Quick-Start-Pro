import { useMemo, useState } from 'react'
import { AUDIT_LOG } from '../../features/audit/mockData'
import { ACTION_TYPE_LABELS } from '../../features/audit/utils'
import AuditLogTable from '../../features/audit/AuditLogTable'
import AuditLogCardList from '../../features/audit/AuditLogCardList'
import AuditDetailDrawer from '../../features/audit/AuditDetailDrawer'
import FilterDropdown from '../../features/students/shared/FilterDropdown'
import type { AuditEntry } from '../../features/audit/types'

const RANGE_OPTIONS = [
  { value: '7',   label: 'Last 7 days' },
  { value: '30',  label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

export default function AuditLogPage() {
  const [userFilter, setUserFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [range, setRange] = useState('7')
  const [selected, setSelected] = useState<AuditEntry | null>(null)

  const userOptions = useMemo(() => {
    const users = Array.from(new Set(AUDIT_LOG.map((e) => e.user))).sort()
    return [{ value: '', label: 'All Users' }, ...users.map((u) => ({ value: u, label: u }))]
  }, [])

  const actionOptions = useMemo(() => {
    const types = Array.from(new Set(AUDIT_LOG.map((e) => e.actionType)))
    return [{ value: '', label: 'All Actions' }, ...types.map((t) => ({ value: t, label: ACTION_TYPE_LABELS[t] ?? t }))]
  }, [])

  const moduleOptions = useMemo(() => {
    const modules = Array.from(new Set(AUDIT_LOG.map((e) => e.module))).sort()
    return [{ value: '', label: 'All Modules' }, ...modules.map((m) => ({ value: m, label: m }))]
  }, [])

  const hasActiveFilters = userFilter !== '' || actionFilter !== '' || moduleFilter !== '' || range !== '7'

  const clearFilters = () => {
    setUserFilter('')
    setActionFilter('')
    setModuleFilter('')
    setRange('7')
  }

  const filtered = useMemo(() => {
    const cutoff = range === 'all' ? null : (() => {
      const d = new Date()
      d.setDate(d.getDate() - Number(range))
      return d
    })()

    return AUDIT_LOG
      .filter((e) => {
        if (cutoff && new Date(e.timestamp) < cutoff) return false
        if (userFilter && e.user !== userFilter) return false
        if (actionFilter && e.actionType !== actionFilter) return false
        if (moduleFilter && e.module !== moduleFilter) return false
        return true
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  }, [userFilter, actionFilter, moduleFilter, range])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[12px] text-gray-500">Dashboard / Audit Log</p>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Audit Log</h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown label="All Users" value={userFilter} options={userOptions} onChange={setUserFilter} />
        <FilterDropdown label="All Actions" value={actionFilter} options={actionOptions} onChange={setActionFilter} />
        <FilterDropdown label="All Modules" value={moduleFilter} options={moduleOptions} onChange={setModuleFilter} />
        <FilterDropdown label="Last 7 days" value={range} options={RANGE_OPTIONS} onChange={setRange} />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[12.5px] font-medium text-gray-500 hover:text-brand-600 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      <AuditLogTable entries={filtered} onSelect={setSelected} />
      <AuditLogCardList entries={filtered} onSelect={setSelected} />

      {selected && <AuditDetailDrawer entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
