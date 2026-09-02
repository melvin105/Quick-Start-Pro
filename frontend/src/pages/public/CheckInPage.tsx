import { useState } from 'react'
import { CalendarX, CheckCircle2, UserX } from 'lucide-react'
import CheckInShell from '../../features/attendance/checkin/CheckInShell'
import InfoScreen from '../../features/attendance/checkin/InfoScreen'
import PhoneScreen from '../../features/attendance/checkin/PhoneScreen'
import ConfirmScreen from '../../features/attendance/checkin/ConfirmScreen'
import InstructorScreen from '../../features/attendance/checkin/InstructorScreen'
import ConfirmedScreen from '../../features/attendance/checkin/ConfirmedScreen'
import {
  listPublicInstructors,
  lookupCheckin,
  submitSelfCheckin,
  type CheckinStudent,
  type PublicInstructor,
} from '../../features/attendance/checkin/checkinService'
import { useApiResource } from '../../lib/useApiResource'
import { toApiError, type ApiError } from '../../lib/apiError'
import LoadingState from '../../components/ui/LoadingState'
import ErrorState from '../../components/ui/ErrorState'

type Screen =
  | { name: 'phone' }
  | { name: 'not-found' }
  | { name: 'no-schedule'; studentName: string }
  | { name: 'already'; studentName: string; checkInTime: string }
  | { name: 'confirm'; phone: string; student: CheckinStudent }
  | { name: 'instructor'; phone: string; student: CheckinStudent }
  | { name: 'confirmed'; studentName: string; checkInTime: string; instructorName?: string }

function timeLabel(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '')
}

export default function CheckInPage() {
  const [screen, setScreen] = useState<Screen>({ name: 'phone' })
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<ApiError | null>(null)
  const instructorsResource = useApiResource(listPublicInstructors)

  const handlePhoneSubmit = async (phone: string) => {
    setSubmitting(true)
    setActionError(null)
    try {
      const result = await lookupCheckin(phone)
      if (result.status === 'not_found') {
        setScreen({ name: 'not-found' })
      } else if (result.status === 'already_checked_in') {
        setScreen({ name: 'already', studentName: result.student.name, checkInTime: timeLabel(result.checkInTime) })
      } else if (!result.scheduledToday) {
        setScreen({ name: 'no-schedule', studentName: result.student.name })
      } else {
        setScreen({ name: 'confirm', phone, student: result.student })
      }
    } catch (err) {
      setActionError(toApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const completeCheckIn = async (phone: string, instructor?: PublicInstructor) => {
    setSubmitting(true)
    setActionError(null)
    try {
      const result = await submitSelfCheckin(phone, instructor?.id)
      setScreen({
        name: 'confirmed',
        studentName: result.studentName,
        checkInTime: timeLabel(result.checkInTime),
        instructorName: result.instructorName ?? undefined,
      })
    } catch (err) {
      setActionError(toApiError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CheckInShell>
      {screen.name === 'phone' && <PhoneScreen loading={submitting} onSubmit={(phone) => void handlePhoneSubmit(phone)} />}

      {screen.name === 'not-found' && (
        <InfoScreen icon={UserX} tone="warning" heading="We couldn't find a student with that number." description="Please see the secretary." />
      )}

      {screen.name === 'no-schedule' && (
        <InfoScreen
          icon={CalendarX}
          tone="warning"
          heading="No lesson scheduled for you today."
          description={`${screen.studentName} — please see the secretary at the desk if you think this is a mistake.`}
        />
      )}

      {screen.name === 'already' && (
        <InfoScreen
          icon={CheckCircle2}
          tone="success"
          heading="You're already checked in!"
          description={`${screen.studentName} — Checked in at ${screen.checkInTime} today.`}
        />
      )}

      {screen.name === 'confirm' && (
        <ConfirmScreen
          student={screen.student}
          onConfirm={() => setScreen({ name: 'instructor', phone: screen.phone, student: screen.student })}
          onNotMe={() => setScreen({ name: 'phone' })}
        />
      )}

      {screen.name === 'instructor' && instructorsResource.loading && <LoadingState message="Loading instructors…" className="py-8" />}
      {screen.name === 'instructor' && instructorsResource.error && (
        <ErrorState error={instructorsResource.error} onRetry={instructorsResource.refetch} className="py-8" />
      )}
      {screen.name === 'instructor' && instructorsResource.data && (
        <InstructorScreen
          instructors={instructorsResource.data}
          onSelect={(instructor) => { if (!submitting) void completeCheckIn(screen.phone, instructor) }}
          onSkip={() => { if (!submitting) void completeCheckIn(screen.phone) }}
        />
      )}

      {screen.name === 'confirmed' && (
        <ConfirmedScreen studentName={screen.studentName} checkInTime={screen.checkInTime} instructorName={screen.instructorName} />
      )}

      {actionError && <p className="text-[13px] text-danger text-center">{actionError.message}</p>}
    </CheckInShell>
  )
}
