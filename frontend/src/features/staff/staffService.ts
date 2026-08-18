import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'
import type { StaffLesson, StaffMember } from './types'

interface ApiInstructor {
  id: string
  first_name: string
  last_name: string
  phone: string
  email?: string | null
  hire_date: string
  status: StaffMember['status']
  lessons_count: number | string
}

interface ApiLesson {
  id: string
  lesson_date: string
  start_time: string
  status: string
  student_id: string
  student_name: string
}

function mapInstructor(row: ApiInstructor): StaffMember {
  return {
    id: row.id,
    name: `${row.first_name} ${row.last_name}`.trim(),
    role: 'instructor',
    phone: row.phone,
    email: row.email ?? undefined,
    addedDate: row.hire_date,
    lessonsCount: Number(row.lessons_count),
    status: row.status,
  }
}

export async function listInstructors(): Promise<StaffMember[]> {
  try {
    const { data } = await api.get<{ instructors: ApiInstructor[] }>('/instructors')
    return data.instructors.map(mapInstructor)
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getInstructor(id: string): Promise<StaffMember> {
  try {
    const { data } = await api.get<ApiInstructor>(`/instructors/${id}`)
    return mapInstructor(data)
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createInstructor(input: { name: string; phone: string }): Promise<StaffMember> {
  const parts = input.name.trim().split(/\s+/)
  try {
    const { data } = await api.post<ApiInstructor>('/instructors', {
      firstName: parts.shift(),
      lastName: parts.join(' ') || '-',
      phone: input.phone,
    })
    return mapInstructor(data)
  } catch (error) {
    throw toApiError(error)
  }
}

export async function removeInstructor(id: string): Promise<'deleted' | 'deactivated'> {
  try {
    const { data } = await api.delete<{ action: 'deleted' | 'deactivated' }>(`/instructors/${id}`)
    return data.action
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listInstructorLessons(id: string): Promise<StaffLesson[]> {
  try {
    const { data } = await api.get<{ lessons: ApiLesson[] }>(`/instructors/${id}/lessons`)
    return data.lessons.map((row) => ({
      id: row.id,
      lessonDate: row.lesson_date,
      startTime: row.start_time,
      status: row.status,
      studentId: row.student_id,
      studentName: row.student_name,
    }))
  } catch (error) {
    throw toApiError(error)
  }
}
