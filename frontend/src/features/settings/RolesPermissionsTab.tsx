import { Fragment } from 'react'
import { Check, X, AlertTriangle } from 'lucide-react'

interface PermissionRow {
  label:   string
  manager: boolean
  secretary: boolean
  flagged?: boolean
  managerOnly?: boolean
}

interface PermissionSection {
  section: string
  rows:    PermissionRow[]
}

const SECTIONS: PermissionSection[] = [
  {
    section: 'Students',
    rows: [
      { label: 'View student profiles',        manager: true, secretary: true },
      { label: 'Edit student profiles',        manager: true, secretary: true },
      { label: 'Override duplicate warning',   manager: true, secretary: false, flagged: true },
    ],
  },
  {
    section: 'Daily Records',
    rows: [
      { label: 'Record expenses',              manager: true, secretary: true },
      { label: 'Submit end of day',             manager: true, secretary: true },
      { label: 'Approve & close day',           manager: true, secretary: false },
      { label: 'View finances analytics',       manager: true, secretary: false },
    ],
  },
  {
    section: 'Admin',
    rows: [
      { label: 'View Audit Log', manager: true, secretary: false, managerOnly: true },
    ],
  },
]

function Cell({ allowed, flagged }: { allowed: boolean; flagged?: boolean }) {
  if (allowed) return <Check size={15} className="text-success mx-auto" />
  return (
    <span className="flex items-center justify-center gap-1">
      <X size={15} className={flagged ? 'text-warning' : 'text-gray-300'} />
      {flagged && <AlertTriangle size={12} className="text-warning" />}
    </span>
  )
}

interface RolesPermissionsTabProps {
  onSaved: () => void
}

export default function RolesPermissionsTab({ onSaved }: RolesPermissionsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12.5px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5">
        Switching roles immediately restricts what each user sees. All role changes are recorded in the Audit Log.
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Permission</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-center">Manager</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-center">Secretary</th>
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((sec) => (
                <Fragment key={sec.section}>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      {sec.section}
                    </td>
                  </tr>
                  {sec.rows.map((row) => (
                    <tr key={row.label} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2.5 text-[13px] text-gray-800">{row.label}</td>
                      <td className="px-4 py-2.5 text-center"><Cell allowed={row.manager} /></td>
                      <td className="px-4 py-2.5 text-center">
                        {row.managerOnly ? <span className="text-gray-300 text-[12px]">n/a</span> : <Cell allowed={row.secretary} flagged={row.flagged} />}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="button"
        onClick={onSaved}
        disabled
        title="Read-only reference view — nothing to save"
        className="self-end px-4 py-2 text-[13px] font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
      >
        Save Changes
      </button>
    </div>
  )
}
