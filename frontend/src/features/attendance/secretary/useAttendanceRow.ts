import { useState } from 'react'
import useAttendanceStore from '../shared/store'
import type { AttendanceRecord, AttendanceStatus } from '../shared/types'

export function useAttendanceRow(record: AttendanceRecord) {
  const mark = useAttendanceStore((s) => s.mark)
  const updateLessonsLeft = useAttendanceStore((s) => s.updateLessonsLeft)
  const [editing, setEditing] = useState(false)

  const handleMark = (status: AttendanceStatus) => {
    mark(record.id, status)
    setEditing(false)
  }

  const handleSaveLessons = (value: number) => {
    updateLessonsLeft(record.id, value)
  }

  const showEditableLessons = Boolean(record.status) && record.status !== 'absent'

  return { editing, setEditing, handleMark, handleSaveLessons, showEditableLessons }
}
