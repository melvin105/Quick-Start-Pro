import { useMemo } from 'react'
import { UserPlus, CreditCard, Eye, IdCard, CalendarClock, GraduationCap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Student } from '../shared/types'
import { formatDate } from '../shared/utils'
import usePaymentsStore from '../../payments/store'
import { formatGHS } from '../../payments/utils'

interface ActivityEntry {
  date:   string
  icon:   LucideIcon
  text:   string
  by?:    string
}

function buildActivity(student: Student, payments: ReturnType<typeof usePaymentsStore.getState>['records']): ActivityEntry[] {
  const entries: ActivityEntry[] = []
  const progress = student.licenceProgress

  if (student.registrationDate) {
    entries.push({ date: student.registrationDate, icon: UserPlus, text: 'Student registered' })
  }

  for (const p of payments.filter((r) => r.studentId === student.id)) {
    entries.push({ date: p.date, icon: CreditCard, text: `Payment recorded — ${formatGHS(p.amount)}`, by: p.recordedBy })
  }

  if (progress?.eyeTest.done && progress.eyeTest.dateDone) {
    entries.push({ date: progress.eyeTest.dateDone, icon: Eye, text: 'Eye test completed' })
  }
  if (progress?.learnerLicence.issued && progress.learnerLicence.dateIssued) {
    entries.push({ date: progress.learnerLicence.dateIssued, icon: IdCard, text: 'Learner licence issued' })
  }
  if (progress?.examDate.date) {
    entries.push({ date: progress.examDate.date, icon: CalendarClock, text: 'DVLA exam scheduled' })
  }
  if (progress?.examResult.passed !== undefined && progress.examResult.date) {
    entries.push({
      date: progress.examResult.date,
      icon: GraduationCap,
      text: `DVLA exam result — ${progress.examResult.passed ? 'Passed' : 'Failed'}`,
    })
  }
  if (progress?.fullLicence.issued && progress.fullLicence.dateIssued) {
    entries.push({ date: progress.fullLicence.dateIssued, icon: IdCard, text: 'Full licence issued' })
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date))
}

export default function StudentActivityTabContent({ student }: { student: Student }) {
  const payments = usePaymentsStore((s) => s.records)
  const activity = useMemo(() => buildActivity(student, payments), [student, payments])

  if (activity.length === 0) {
    return (
      <div className="py-16 text-center text-[13px] text-gray-500 bg-white border border-dashed border-gray-300 rounded-2xl">
        No activity recorded yet.
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex flex-col divide-y divide-gray-100">
        {activity.map((entry, i) => (
          <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <entry.icon size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[13.5px] text-gray-900">{entry.text}</p>
              <p className="text-[11.5px] text-gray-500">
                {formatDate(entry.date)}{entry.by ? ` · ${entry.by}` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
