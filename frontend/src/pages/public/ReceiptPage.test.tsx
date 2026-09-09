import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ReceiptPage from './ReceiptPage'

vi.mock('../../lib/useApiResource', () => ({
  useApiResource: () => ({
    data: {
      id: 'receipt-1',
      receipt_no: 'R-0042',
      student_name: 'Ama Mensah',
      package_name: 'Driving + Licence',
      amount: 500,
      method: 'cash',
      package_fee: 2500,
      total_paid: 500,
      balance: 2000,
      payment_date: '2026-09-09',
      recorded_by_name: 'Secretary',
      school: {
        name: 'Quick Start Driving School',
        address: 'Spintex Road, Accra',
        phone: null,
      },
    },
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('ReceiptPage', () => {
  it('marks the receipt card as the printable area', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ReceiptPage />
      </MemoryRouter>,
    )

    expect(html).toContain('class="print-area ')
    expect(html).toContain('RECEIPT R-0042')
    expect(html).toContain('Ama Mensah')
  })
})
