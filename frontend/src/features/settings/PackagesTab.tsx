import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import PackageModal from './PackageModal'
import type { CoursePackage } from './types'
import { createPackage, listPackages, updatePackage } from './packagesService'
import { toCoursePackage } from './packageMappers'
import { useApiResource } from '../../lib/useApiResource'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString()}`
}

interface PackagesTabProps {
  onSaved: () => void
}

export default function PackagesTab({ onSaved }: PackagesTabProps) {
  const { data, loading, error, refetch } = useApiResource(() => listPackages())
  const packages = (data ?? []).map(toCoursePackage)

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<CoursePackage | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14.5px] font-semibold text-gray-900">Course Packages</h2>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
        >
          <Plus size={15} /> Add Package
        </button>
      </div>

      {loading && <LoadingState message="Loading packages…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Package Name', 'Lessons', 'Price', 'Edit'].map((col) => (
                  <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{pkg.name}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{pkg.lessonCount}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{formatGHS(pkg.price)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setEditing(pkg)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      aria-label={`Edit ${pkg.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}

      {showAdd && (
        <PackageModal
          onClose={() => setShowAdd(false)}
          onSave={async (input) => {
            await createPackage({ packageName: input.name, totalFee: input.price, lessonCount: input.lessonCount })
            await refetch()
            setShowAdd(false)
            onSaved()
          }}
        />
      )}

      {editing && (
        <PackageModal
          editing={editing}
          onClose={() => setEditing(null)}
          onSave={async (input) => {
            await updatePackage(editing.id, { packageName: input.name, totalFee: input.price, lessonCount: input.lessonCount })
            await refetch()
            setEditing(null)
            onSaved()
          }}
        />
      )}
    </div>
  )
}
