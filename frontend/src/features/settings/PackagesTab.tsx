import { useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import PackageModal from './PackageModal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import type { CoursePackage } from './types'
import { createPackage, listPackages, updatePackage, deletePackage } from './packagesService'
import { toCoursePackage } from './packageMappers'
import { useApiResource } from '../../lib/useApiResource'
import { ApiError } from '../../lib/apiError'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

function formatGHS(amount: number) {
  return `GHS ${amount.toLocaleString()}`
}

interface PackagesTabProps {
  // Called after a successful mutation. The optional message lets the toast say
  // what happened (saved vs deleted); defaults are handled by the caller.
  onSaved: (message?: string) => void
}

export default function PackagesTab({ onSaved }: PackagesTabProps) {
  const { data, loading, error, refetch } = useApiResource(() => listPackages())
  const packages = (data ?? []).map(toCoursePackage)

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<CoursePackage | null>(null)
  // The package the manager is confirming deletion of, and any error the delete
  // came back with (e.g. 409 when students are still enrolled).
  const [deleting, setDeleting] = useState<CoursePackage | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deletePackage(deleting.id)
      await refetch()
      setDeleting(null)
      onSaved('Package deleted')
    } catch (err) {
      // Keep the confirm dialog closed but surface why it couldn't be deleted —
      // most often the backend's "has enrolled students, deactivate instead".
      setDeleting(null)
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete this package.')
    }
  }

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

      {deleteError && (
        <div className="flex items-start gap-2 rounded-lg bg-danger-bg text-danger px-3 py-2 text-[12.5px]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {loading && <LoadingState message="Loading packages…" />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && packages.length === 0 && (
        <p className="text-[13px] text-gray-500 py-6 text-center">No packages yet. Add one to get started.</p>
      )}

      {!loading && !error && packages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col px-4 py-3 rounded-xl border-2 border-gray-200"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13.5px] font-medium text-gray-800">{pkg.name}</p>
                <div className="flex items-center gap-0.5 shrink-0 -mr-1.5 -mt-1">
                  <button
                    type="button"
                    onClick={() => setEditing(pkg)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    aria-label={`Edit ${pkg.name}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeleteError(null); setDeleting(pkg) }}
                    className="p-1.5 rounded-md text-gray-400 hover:text-danger hover:bg-danger-bg transition-colors"
                    aria-label={`Delete ${pkg.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-[12.5px] text-gray-600 mt-1">{formatGHS(pkg.price)}</p>
              <p className="text-[11.5px] text-gray-400 mt-0.5">{pkg.lessonCount} lessons</p>
              {!pkg.isActive && (
                <span className="mt-2 inline-flex w-fit items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10.5px] font-medium text-gray-500">
                  Inactive
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <PackageModal
          onClose={() => setShowAdd(false)}
          onSave={async (input) => {
            await createPackage({ packageName: input.name, totalFee: input.price, lessonCount: input.lessonCount })
            await refetch()
            setShowAdd(false)
            onSaved('Package saved')
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
            onSaved('Package saved')
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete package"
          message={`Delete "${deleting.name}"? This can't be undone. Packages with enrolled students can't be deleted — deactivate them instead.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
