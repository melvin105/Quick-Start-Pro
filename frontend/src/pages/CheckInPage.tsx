import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, UserX } from 'lucide-react'
import useStudentsStore from '../features/students/store'
import useAttendanceStore from '../features/attendance/store'
import { isTodayCode, normalizePhone } from '../features/attendance/utils'
import CheckInShell from '../features/attendance/checkin/CheckInShell'
import InfoScreen from '../features/attendance/checkin/InfoScreen'
import PhoneScreen from '../features/attendance/checkin/PhoneScreen'
import ConfirmScreen from '../features/attendance/checkin/ConfirmScreen'
import InstructorScreen from '../features/attendance/checkin/InstructorScreen'
import ConfirmedScreen from '../features/attendance/checkin/ConfirmedScreen'
import type { Student } from '../features/students/types'

type Screen =
  | { name: 'phone' }
  | { name: 'not-found' }
  | { name: 'already'; studentName: string; checkInTime: string }
  | { name: 'confirm'; student: Student }
  | { name: 'instructor'; student: Student }
  | { name: 'confirmed'; studentName: string; checkInTime: string; instructorName?: string }

export default function CheckInPage() {
  const { code } = useParams<{ code: string }>()
  const students = useStudentsStore((s) => s.students)
  const findTodayRecord = useAttendanceStore((s) => s.findTodayRecordByStudentId)
  const selfCheckIn = useAttendanceStore((s) => s.selfCheckIn)

  const [screen, setScreen] = useState<Screen>({ name: 'phone' })

  const expired = useMemo(() => !code || !isTodayCode(code), [code])

  if (expired) {
    return (
      <CheckInShell>
        <InfoScreen
          icon={AlertTriangle}
          tone="warning"
          heading="This QR code has expired."
          description="Please scan the current code on display at reception."
        />
      </CheckInShell>
    )
  }

  const handlePhoneSubmit = (phone: string) => {
    const target = normalizePhone(phone)
    const student = students.find((s) => normalizePhone(s.phone) === target)
    if (!student) {
      setScreen({ name: 'not-found' })
      return
    }
    const existing = findTodayRecord(student.id)
    if (existing?.checkInTime) {
      setScreen({ name: 'already', studentName: student.name, checkInTime: existing.checkInTime })
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
