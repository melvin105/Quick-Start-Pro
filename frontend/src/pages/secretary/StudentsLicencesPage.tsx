import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import useStudentsStore from '../../features/students/shared/store'
import { DEFAULT_LICENCE_PROGRESS, buildLicenceSteps, type LicenceStepKey } from '../../features/students/shared/licence'
import FilterDropdown from '../../features/students/secretary/FilterDropdown'
import { formatDateShort, studentProfilePath, studentLicencePath } from '../../features/students/shared/utils'
import type { EnrolmentType } from '../../features/students/shared/types'

const STAGE_OPTIONS = [
  { value: '', label: 'Stage' },
  { value: 'eyeTest', label: 'Eye Test' },
  { value: 'learnerLicence', label: 'Learner Licence' },
  { value: 'examDate', label: 'Exam Date' },
  { value: 'examResult', label: 'Exam Result' },
  { value: 'fullLicence', label: 'Full Licence' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Status' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
]

const ENROLMENT_OPTIONS = [
  { value: '', label: 'Enrolment' },
  { value: 'Licence Only', label: 'Licence Only' },
  { value: 'Driving + Licence', label: 'Driving + Licence' },
]

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export default function StudentsLicencesPage() {
  const students = useStudentsStore((s) => s.students)
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [enrolmentFilter, setEnrolmentFilter] = useState<EnrolmentType | ''>('')

  const rows = useMemo(() => {
    return students
      .filter((s) => s.enrolment !== 'Driving Only')
      .map((student) => {
        const progress = student.licenceProgress ?? DEFAULT_LICENCE_PROGRESS
        const steps = buildLicenceSteps(progress)
        const currentStageKey: LicenceStepKey | undefined = steps.find((s) => s.status === 'active')?.key
        const isComplete = steps.find((s) => s.key === 'fullLicence')?.status === 'done'
        return { student, progress, steps, currentStageKey, isComplete }
      })
  }, [students])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesEnrolment = !enrolmentFilter || row.student.enrolment === enrolmentFilter
      const matchesStage = !stageFilter || row.currentStageKey === stageFilter
      const matchesStatus =
        !statusFilter || (statusFilter === 'complete' ? row.isComplete : !row.isComplete)
      return matchesEnrolment && matchesStage && matchesStatus
    })
  }, [rows, enrolmentFilter, stageFilter, statusFilter])

  const stats = useMemo(() => ({
    eligible:       rows.length,
    learnerIssued:  rows.filter((r) => r.progress.learnerLicence.issued).length,
    learnerPending: rows.filter((r) => !r.progress.learnerLicence.issued).length,
    examScheduled:  rows.filter((r) => Boolean(r.progress.examDate.date)).length,
  }), [rows])

  const handleExportCsv = () => {
    const header = ['Student No.', 'Name', 'Enrolment', 'Eye Test', 'Learner Licence', 'Exam Date', 'Full Licence']
    const lines = filteredRows.map(({ student, progress }) => [
      student.id,
      student.name,
      student.enrolment,
      progress.eyeTest.done ? `Done ${progress.eyeTest.dateDone ?? ''}`.trim() : 'Pending',
      progress.learnerLicence.issued ? `Issued ${progress.learnerLicence.dateIssued ?? ''}`.trim() : 'Pending',
      progress.examDate.date ?? '',
      progress.fullLicence.issued ? `Issued ${progress.fullLicence.dateIssued ?? ''}`.trim() : '',
    ].map(csvEscape).join(','))

    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dvla-batch-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] text-gray-500">Dashboard / Students / Licences</p>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Students — Licences</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xl font-semibold text-gray-900">{stats.eligible}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Licence-eligible</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xl font-semibold text-success">{stats.learnerIssued}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Learner issued</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xl font-semibold text-warning">{stats.learnerPending}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Learner pending</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xl font-semibold text-gray-900">{stats.examScheduled}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Exam scheduled</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown label="Stage" value={stageFilter} options={STAGE_OPTIONS} onChange={setStageFilter} />
        <FilterDropdown label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
        <FilterDropdown
          label="Enrolment"
          value={enrolmentFilter}
          options={ENROLMENT_OPTIONS}
          onChange={(v) => setEnrolmentFilter(v as EnrolmentType | '')}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Student No.', 'Name', 'Enrolment', 'Eye Test', 'Learner Lic.', 'Exam Date', 'Full Lic.', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ student, progress }) => (
                <tr key={student.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">{student.id}</td>
                  <td className="px-4 py-3 text-[13.5px] font-medium text-gray-900 whitespace-nowrap">
                    <Link to={studentProfilePath(student.id)} className="hover:text-brand-600 transition-colors">
                      {student.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{student.enrolment}</td>
                  <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                    {progress.eyeTest.done
                      ? <span className="text-success font-medium">✓ Done</span>
                      : <span className="text-gray-400">Pending</span>}
                  </td>
                  <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                    {progress.learnerLicence.issued && progress.learnerLicence.dateIssued
                      ? <span className="text-success font-medium">✓ {formatDateShort(progress.learnerLicence.dateIssued)}</span>
                      : <span className="text-gray-400">Pending</span>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">
                    {progress.examDate.date ? formatDateShort(progress.examDate.date) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                    {progress.fullLicence.issued && progress.fullLicence.dateIssued
                      ? <span className="text-success font-medium">✓ {formatDateShort(progress.fullLicence.dateIssued)}</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[12px] whitespace-nowrap">
                    <Link to={studentLicencePath(student.id)} className="text-brand-600 hover:text-brand-700 font-medium">
                      Update →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 && (
          <div className="py-12 text-center text-[13px] text-gray-500">No licence-eligible students match your filters.</div>
        )}
      </div>

      <p className="text-[12.5px] text-gray-500">
        Showing {filteredRows.length} student{filteredRows.length === 1 ? '' : 's'}
      </p>

      <button
        type="button"
        onClick={handleExportCsv}
        className="self-start flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
      >
        <Download size={15} />
        Export DVLA Batch CSV
      </button>
    </div>
  )
}
