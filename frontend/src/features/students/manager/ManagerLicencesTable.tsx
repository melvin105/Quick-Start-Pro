import { useNavigate } from 'react-router-dom'
import type { Student } from '../shared/types'
import { DEFAULT_LICENCE_PROGRESS, buildLicenceSteps } from '../shared/licence'
import { studentProfilePath } from '../shared/utils'

interface ManagerLicencesTableProps {
  students: Student[]
}

const COLUMNS = ['Student', 'Enrolment', 'Pipeline Step', 'Next Action', 'Status']

function pipelineFor(student: Student) {
  const steps = buildLicenceSteps(student.licenceProgress ?? DEFAULT_LICENCE_PROGRESS)
  const current = steps.find((s) => s.status === 'active')
  const complete = steps.every((s) => s.status === 'done')

  return {
    stepLabel:  complete ? 'Full Licence' : current?.label ?? '—',
    nextAction: complete ? 'None' : current?.lockedReason ?? current?.detail ?? 'Awaiting update',
    complete,
  }
}

export default function ManagerLicencesTable({ students }: ManagerLicencesTableProps) {
  const navigate = useNavigate()

  const openLicenceTab = (id: string) => navigate(`${studentProfilePath(id)}?tab=licence`)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {COLUMNS.map((col) => (
                <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const { stepLabel, nextAction, complete } = pipelineFor(student)
              return (
                <tr
                  key={student.id}
                  onClick={() => openLicenceTab(student.id)}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <p className="text-[13.5px] font-medium text-gray-900 whitespace-nowrap">{student.name}</p>
                    <p className="text-[11.5px] text-gray-500">{student.id}</p>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{student.enrolment}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-900 whitespace-nowrap">{stepLabel}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">{nextAction}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                      complete ? 'bg-success-bg text-success' : 'bg-brand-50 text-brand-600'
                    }`}>
                      {complete ? 'Complete' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {students.length === 0 && (
        <div className="py-12 text-center text-[13px] text-gray-500">No students with a licence pipeline in progress.</div>
      )}
    </div>
  )
}
