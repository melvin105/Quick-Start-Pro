import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Student, PendingSubmission } from './types'
import { STUDENTS, PENDING_SUBMISSIONS } from './mockData'

interface StudentsState {
  students: Student[]
  pending:  PendingSubmission[]
  addStudent: (student: Student) => void
  updateStudent: (id: string, patch: Partial<Student>) => void
  addPending: (submission: PendingSubmission) => void
  removePending: (id: string) => void
  nextStudentId: () => string
}

// Persisted so records created mid-session (registrations, payments, etc.)
// are still there if a page is opened in a new tab or reloaded — e.g. a
// printed receipt for a payment recorded moments earlier.
const useStudentsStore = create<StudentsState>()(
  persist(
    (set, get) => ({
      students: STUDENTS,
      pending:  PENDING_SUBMISSIONS,

      addStudent: (student) => set((s) => ({ students: [student, ...s.students] })),

      updateStudent: (id, patch) => set((s) => ({
        students: s.students.map((student) => (student.id === id ? { ...student, ...patch } : student)),
      })),

      addPending: (submission) => set((s) => ({ pending: [submission, ...s.pending] })),

      removePending: (id) => set((s) => ({ pending: s.pending.filter((p) => p.id !== id) })),

      nextStudentId: () => {
        const year = new Date().getFullYear()
        const prefix = `QS-${year}-`
        const numbers = get()
          .students.filter((s) => s.id.startsWith(prefix))
          .map((s) => parseInt(s.id.slice(prefix.length), 10))
          .filter((n) => !Number.isNaN(n))
        const next = (numbers.length ? Math.max(...numbers) : 0) + 1
        return `${prefix}${String(next).padStart(3, '0')}`
      },
    }),
    { name: 'qsp-students' },
  ),
)

export default useStudentsStore
