export type ReportCell = string | number

export interface ReportColumn<Row> {
  key: string
  header: string
  value: (row: Row) => ReportCell
}

export interface ReportSummaryCard {
  label: string
  value: ReportCell
}

export interface ReportExportInput<Row> {
  title: string
  from: string
  to: string
  summaryCards: ReportSummaryCard[]
  columns: ReportColumn<Row>[]
  rows: Row[]
  filename: string
  generatedBy: string
  filterDescription?: string
}

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

function parseDateOnly(value: string) {
  if (!DATE_ONLY_RE.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatReportDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  const text = String(value)
  const date = parseDateOnly(text) ?? new Date(text)
  if (Number.isNaN(date.getTime())) return text
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export function formatReportMonth(value: unknown): string {
  const text = String(value ?? '')
  if (!/^\d{4}-\d{2}$/.test(text)) return text || '—'
  const [year, month] = text.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(new Date(year, month - 1, 1))
}

export function formatReportDateRange(from: string, to: string): string {
  const fromDate = parseDateOnly(from)
  const toDate = parseDateOnly(to)
  if (fromDate && toDate && fromDate.getFullYear() === toDate.getFullYear()) {
    const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(fromDate)
    return `${shortDate} to ${formatReportDate(to)}`
  }
  return `${formatReportDate(from)} to ${formatReportDate(to)}`
}

export function createReportFilename(reportName: string, from: string, to: string, extension: 'csv' | 'pdf') {
  return `${reportName}-report_${from}_${to}.${extension}`
}

function csvEscape(value: ReportCell) {
  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function buildReportCsv<Row>(columns: ReportColumn<Row>[], rows: Row[]) {
  const header = columns.map((column) => csvEscape(column.header)).join(',')
  const body = rows.map((row) => columns.map((column) => csvEscape(column.value(row))).join(','))
  return `\uFEFF${[header, ...body].join('\r\n')}`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function exportReportCsv<Row>(columns: ReportColumn<Row>[], rows: Row[], filename: string) {
  const csv = buildReportCsv(columns, rows)
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), filename)
}

export async function buildReportPdf<Row>(input: ReportExportInput<Row>): Promise<Blob> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const orientation = input.columns.length > 6 ? 'landscape' : 'portrait'
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setTextColor(26, 58, 105)
  doc.setFontSize(17)
  doc.setFont('helvetica', 'bold')
  doc.text('Quick Start Pro', 40, 42)

  doc.setTextColor(31, 41, 55)
  doc.setFontSize(14)
  doc.text(input.title, 40, 70)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const filterSuffix = input.filterDescription ? ` · ${input.filterDescription}` : ''
  doc.text(`${input.title} — ${formatReportDateRange(input.from, input.to)}${filterSuffix}`, 40, 89)

  let summaryY = 108
  if (input.summaryCards.length > 0) {
    const gap = 8
    const availableWidth = pageWidth - 80
    const cardWidth = (availableWidth - gap * (input.summaryCards.length - 1)) / input.summaryCards.length
    input.summaryCards.forEach((card, index) => {
      const x = 40 + index * (cardWidth + gap)
      doc.setFillColor(245, 247, 250)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(x, summaryY, cardWidth, 42, 4, 4, 'FD')
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text(card.label, x + 8, summaryY + 14)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(31, 41, 55)
      doc.text(String(card.value), x + 8, summaryY + 31)
      doc.setFont('helvetica', 'normal')
    })
    summaryY += 58
  }

  autoTable(doc, {
    startY: summaryY,
    head: [input.columns.map((column) => column.header)],
    body: input.rows.map((row) => input.columns.map((column) => String(column.value(row)))),
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [26, 58, 105], textColor: 255 },
    margin: { left: 40, right: 40, bottom: 42 },
  })

  const pageCount = doc.getNumberOfPages()
  const generatedAt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setDrawColor(226, 232, 240)
    doc.line(40, pageHeight - 30, pageWidth - 40, pageHeight - 30)
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(`Generated by ${input.generatedBy} · ${generatedAt}`, 40, pageHeight - 16)
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - 40, pageHeight - 16, { align: 'right' })
  }

  return doc.output('blob')
}

export async function exportReportPdf<Row>(input: ReportExportInput<Row>) {
  const blob = await buildReportPdf(input)
  downloadBlob(blob, input.filename)
}
