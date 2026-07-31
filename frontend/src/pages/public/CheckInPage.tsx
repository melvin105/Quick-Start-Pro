import { useState } from 'react'
import { CalendarX, CheckCircle2, UserX } from 'lucide-react'
import useStudentsStore from '../../features/students/shared/store'
import useAttendanceStore from '../../features/attendance/shared/store'
import { normalizePhone } from '../../features/attendance/shared/utils'
import CheckInShell from '../../features/attendance/checkin/CheckInShell'
import InfoScreen from '../../features/attendance/checkin/InfoScreen'
import PhoneScreen from '../../features/attendance/checkin/PhoneScreen'
import ConfirmScreen from '../../features/attendance/checkin/ConfirmScreen'
import InstructorScreen from '../../features/attendance/checkin/InstructorScreen'
import ConfirmedScreen from '../../features/attendance/checkin/ConfirmedScreen'
import type { Student } from '../../features/students/shared/types'

type Screen =
  | { name: 'phone' }
  | { name: 'not-found' }
  | { name: 'no-schedule'; studentName: string }
  | { name: 'already'; studentName: string; checkInTime: string }
  | { name: 'confirm'; student: Student }
  | { name: 'instructor'; student: Student }
  | { name: 'confirmed'; studentName: string; checkInTime: string; instructorName?: string }

export default function CheckInPage() {
  const students = useStudentsStore((s) => s.students)
  const findTodayRecord = useAttendanceStore((s) => s.findTodayRecordByStudentId)
  const selfCheckIn = useAttendanceStore((s) => s.selfCheckIn)
  const syncFromSchedule = useAttendanceStore((s) => s.syncFromSchedule)

  const [screen, setScreen] = useState<Screen>({ name: 'phone' })

  const handlePhoneSubmit = (phone: string) => {
    const target = normalizePhone(phone)
    const student = students.find((s) => normalizePhone(s.phone) === target)
    if (!student) {
      setScreen({ name: 'not-found' })
      return
    }
    // Picks up anything scheduled for today that doesn't have a row yet, so
    // "no record" below reliably means "genuinely not expected today" rather
    // than "just hasn't been synced from the schedule."
    syncFromSchedule()
    const existing = findTodayRecord(student.id)
    if (existing?.checkInTime) {
      setScreen({ name: 'already', studentName: student.name, checkInTime: existing.checkInTime })
      return
    }
    if (!existing) {
      setScreen({ name: 'no-schedule', studentName: student.name })
      return
    }
    setScreen({ name: 'confirm', student })
  }

  const completeCheckIn = (student: Student, instructorName?: string) => {
    const existing = findTodayRecord(student.id)
    const lessonsLeft = existing?.lessonsLeft
      ?? (student.lessonsPackageTotal != null && student.lessonsTaken != null
        ? Math.max(student.lessonsPackageTotal - student.lessonsTaken, 0)
        : 10)
    selfCheckIn(student.id, student.name, lessonsLeft, instructorName)
    const record = findTodayRecord(student.id)
    setScreen({
      name: 'confirmed',
      studentName: student.name,
      checkInTime: record?.checkInTime ?? '',
      instructorName,
    })
  }

  return (
    <CheckInShell>
      {screen.name === 'phone' && <PhoneScreen onSubmit={handlePhoneSubmit} />}

      {screen.name === 'not-found' && (
        <InfoScreen
          icon={UserX}
          tone="warning"
          heading="We couldn't find a student with that number."
          description="Please see the secretary."
        />
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
          onConfirm={() => setScreen({ name: 'instructor', student: screen.student })}
          onNotMe={() => setScreen({ name: 'phone' })}
        />
      )}

      {screen.name === 'instructor' && (
        <InstructorScreen
          onSelect={(name) => completeCheckIn(screen.student, name)}
          onSkip={() => completeCheckIn(screen.student)}
        />
      )}

      {screen.name === 'confirmed' && (
        <ConfirmedScreen
          studentName={screen.studentName}
          checkInTime={screen.checkInTime}
          instructorName={screen.instructorName}
        />
      )}
    </CheckInShell>
  )
}
