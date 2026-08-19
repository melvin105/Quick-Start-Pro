export interface LessonFact {
  instructor: string // first name — matches attendance `driverName` values
  student:    string
  date:       string // ISO
}

const INSTRUCTORS = ['Obed', 'Patrick', 'Fred']

// The app's real student roster (features/students/shared/mockData.ts) so a
// "Lessons by Student" row can genuinely link to that student's profile.
const STUDENTS = ['John Mensah', 'Mary Owusu', 'Kwesi Boateng', 'Ama Asante', 'Yaw Darko', 'Akwasi Asenso']

// 12 months of lesson volume per instructor, Aug 2025 – Jul 2026.
const MONTHLY_COUNTS: Record<string, number[]> = {
  Obed:    [14, 15, 17, 16, 18, 19, 20, 21, 19, 22, 20, 18],
  Patrick: [10, 11, 12, 13, 12, 14, 15, 16, 14, 17, 16, 14],
  Fred:    [7, 8, 8, 9, 9, 10, 10, 11, 10, 12, 11, 9],
}

const MONTH_KEYS = [
  '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07',
]

function daysInMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function generateFacts(): LessonFact[] {
  const facts: LessonFact[] = []
  for (const instructor of INSTRUCTORS) {
    const counts = MONTHLY_COUNTS[instructor]
    MONTH_KEYS.forEach((ym, monthIdx) => {
      const count = counts[monthIdx]
      const dim = daysInMonth(ym)
      for (let n = 0; n < count; n++) {
        const day = Math.min(dim, Math.floor((n / count) * dim) + 1)
        const date = `${ym}-${String(day).padStart(2, '0')}`
        const student = STUDENTS[(n + INSTRUCTORS.indexOf(instructor)) % STUDENTS.length]
        facts.push({ instructor, student, date })
      }
    })
  }
  return facts
}

export const LESSON_FACTS: LessonFact[] = generateFacts()

export function lessonsInRange(instructor: string, from: string, to: string): LessonFact[] {
  return LESSON_FACTS.filter((f) => f.instructor === instructor && f.date >= from && f.date <= to)
}

export function totalAllTime(instructor: string): number {
  return LESSON_FACTS.filter((f) => f.instructor === instructor).length
}

export function avgPerWeek(count: number, from: string, to: string): number {
  const days = Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000) + 1)
  const weeks = days / 7
  return weeks > 0 ? Math.round((count / weeks) * 10) / 10 : 0
}

export interface MonthlyLessonRow {
  label: string
  count: number
}

// Newest month first, most recent 12 months.
export function monthlyBreakdown(instructor: string): MonthlyLessonRow[] {
  return [...MONTH_KEYS].map((ym, idx) => {
    const [y, m] = ym.split('-').map(Number)
    const label = new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    return { label, count: MONTHLY_COUNTS[instructor][idx] }
  }).reverse()
}

export interface StudentBreakdownRow {
  student: string
  period:  number
  total:   number
}

export function studentBreakdown(instructor: string, from: string, to: string): StudentBreakdownRow[] {
  const inRange = lessonsInRange(instructor, from, to)
  const allTime = LESSON_FACTS.filter((f) => f.instructor === instructor)
  const students = Array.from(new Set(allTime.map((f) => f.student)))

  return students
    .map((student) => ({
      student,
      period: inRange.filter((f) => f.student === student).length,
      total:  allTime.filter((f) => f.student === student).length,
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.period - a.period || b.total - a.total)
}

export { INSTRUCTORS as REPORT_INSTRUCTORS }
