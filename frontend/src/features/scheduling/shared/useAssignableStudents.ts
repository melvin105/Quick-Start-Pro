import { useMemo } from 'react'
import { useApiResource } from '../../../lib/useApiResource'
import { listStudents, type ApiEnrolmentType } from '../../students/shared/studentService'

// The trimmed student shape the assign pickers render — just what the search
// list and the assign call need. Replaces the mock students store lookup the
// secretary scheduling surface used before it went live.
export interface PickableStudent {
  id:             string
  studentNumber:  string
  name:           string
  enrolmentLabel: string
}

const ENROLMENT_LABEL: Record<ApiEnrolmentType, string> = {
  driving_only:        'Driving Only',
  licence_only:        'Licence Only',
  driving_and_licence: 'Driving & Licence',
}

// Active students who take driving lessons. Licence-only enrolments never get a
// slot, so they're filtered out here. Fetched once when an assign surface opens
// (limit 100 — the backend caps it there, well above a real roster); callers
// then drop those already in the slot and match the search box client-side.
export function useAssignableStudents() {
  const { data, loading, error } = useApiResource(() =>
    listStudents({ status: 'active', limit: 100 }),
  )

  const students = useMemo<PickableStudent[]>(() => {
    if (!data) return []
    return data.students
      .filter((s) => s.enrolment_type !== 'licence_only')
      .map((s) => ({
        id:             s.id,
        studentNumber:  s.student_number,
        name:           `${s.first_name} ${s.last_name}`,
        enrolmentLabel: ENROLMENT_LABEL[s.enrolment_type],
      }))
  }, [data])

  return { students, loading, error }
}
