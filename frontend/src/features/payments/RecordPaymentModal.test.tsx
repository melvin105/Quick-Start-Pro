import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import RecordPaymentModal from './RecordPaymentModal'
import type { ApiStudentListRow } from '../students/shared/studentService'

const student: ApiStudentListRow = {
  id: 'student-1',
  student_number: 'DP-2026-0001',
  first_name: 'Ama',
  last_name: 'Mensah',
  gender: 'female',
  phone: '0200000000',
  email: null,
  status: 'active',
  enrolment_type: 'driving_and_licence',
  registration_date: '2026-09-09',
  photo_url: null,
  total_fees: 2500,
  total_paid: 500,
  balance: 2000,
  package_name: 'Driving + Licence',
}

describe('RecordPaymentModal', () => {
  it('requires a choice between the full balance and a custom amount', () => {
    const html = renderToStaticMarkup(
      <RecordPaymentModal
        onClose={vi.fn()}
        onRecorded={vi.fn()}
        students={[student]}
        initialStudentId={student.id}
      />,
    )

    expect(html).toContain('Pay full package')
    expect(html).toContain('Pay the outstanding balance of GHS 2,000')
    expect(html).toContain('Enter another amount')
    expect(html).toContain('Record a partial payment')
    expect(html).toContain('disabled=""')
  })
})
