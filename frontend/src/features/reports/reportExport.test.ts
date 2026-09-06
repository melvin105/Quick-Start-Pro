import { describe, expect, it } from 'vitest'
import { buildReportCsv, buildReportPdf, createReportFilename, formatReportDate, formatReportDateRange } from './reportExport'

const columns = [
  { key: 'date', header: 'Date', value: (row: { date: string; note: string }) => formatReportDate(row.date) },
  { key: 'note', header: 'Description', value: (row: { date: string; note: string }) => row.note },
]
const rows = [{ date: '2026-09-02', note: 'Fuel, oil and "service"' }]

describe('report exports', () => {
  it('uses the visible headers and formatted visible values in CSV', () => {
    expect(buildReportCsv(columns, rows)).toBe('\uFEFFDate,Description\r\n"Sep 2, 2026","Fuel, oil and ""service"""')
  })

  it('builds the required dated filename', () => {
    expect(createReportFilename('expense', '2026-08-01', '2026-09-02', 'csv'))
      .toBe('expense-report_2026-08-01_2026-09-02.csv')
    expect(formatReportDateRange('2026-08-01', '2026-09-02')).toBe('Aug 1 to Sep 2, 2026')
  })

  it('creates a readable PDF document from the same columns and rows', async () => {
    const blob = await buildReportPdf({
      title: 'Expense Report', from: '2026-08-01', to: '2026-09-02',
      summaryCards: [{ label: 'Records', value: 1 }], columns, rows,
      filename: 'expense-report_2026-08-01_2026-09-02.pdf', generatedBy: 'Test Manager',
    })
    expect(blob.type).toBe('application/pdf')
    expect(blob.size).toBeGreaterThan(1_000)
    expect(new TextDecoder().decode((await blob.arrayBuffer()).slice(0, 5))).toBe('%PDF-')
  })
})
