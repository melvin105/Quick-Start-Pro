import type { ReportColumn, ReportSummaryCard } from './reportExport'
import { formatReportDate, formatReportMonth } from './reportExport'
import type { LiveReportKind, ReportRow } from './reportService'

export interface LiveReportDefinition {
  title: string
  filename: string
  columns: ReportColumn<ReportRow>[]
  summaries: (rows: ReportRow[]) => ReportSummaryCard[]
}

function text(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function money(value: unknown) {
  return `GHS ${Number(value ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function count(rows: ReportRow[], key: string, value: string) {
  return rows.filter((row) => String(row[key] ?? '').toLowerCase() === value).length
}

const students: LiveReportDefinition = {
  title: 'Student Report', filename: 'student',
  columns: [
    { key: 'student_number', header: 'Student No.', value: (row) => text(row.student_number) },
    { key: 'student_name', header: 'Name', value: (row) => text(row.student_name) },
    { key: 'registration_date', header: 'Registration Date', value: (row) => formatReportDate(row.registration_date) },
    { key: 'status', header: 'Status', value: (row) => text(row.status) },
    { key: 'enrolment_type', header: 'Enrolment', value: (row) => text(row.enrolment_type) },
  ],
  summaries: (rows) => [
    { label: 'Students', value: rows.length },
    { label: 'Active', value: count(rows, 'status', 'active') },
    { label: 'Completed', value: count(rows, 'status', 'completed') },
  ],
}

const attendance: LiveReportDefinition = {
  title: 'Attendance Report', filename: 'attendance',
  columns: [
    { key: 'attendance_date', header: 'Date', value: (row) => formatReportDate(row.attendance_date) },
    { key: 'student_number', header: 'Student No.', value: (row) => text(row.student_number) },
    { key: 'student_name', header: 'Student', value: (row) => text(row.student_name) },
    { key: 'instructor_name', header: 'Instructor', value: (row) => text(row.instructor_name) },
    { key: 'status', header: 'Status', value: (row) => text(row.status) },
    { key: 'method', header: 'Method', value: (row) => text(row.method) },
    { key: 'check_in_time', header: 'Check-in Time', value: (row) => text(row.check_in_time) },
  ],
  summaries: (rows) => [
    { label: 'Attendance Records', value: rows.length },
    { label: 'Present', value: count(rows, 'status', 'present') },
    { label: 'Late', value: count(rows, 'status', 'late') },
    { label: 'Absent', value: count(rows, 'status', 'absent') },
  ],
}

const revenue: LiveReportDefinition = {
  title: 'Revenue Report', filename: 'revenue',
  columns: [
    { key: 'month', header: 'Month', value: (row) => formatReportMonth(row.month) },
    { key: 'payment_count', header: 'Payments', value: (row) => Number(row.payment_count ?? 0) },
    { key: 'total_revenue', header: 'Revenue', value: (row) => money(row.total_revenue) },
  ],
  summaries: (rows) => [
    { label: 'Months', value: rows.length },
    { label: 'Payments', value: rows.reduce((sum, row) => sum + Number(row.payment_count ?? 0), 0) },
    { label: 'Total Revenue', value: money(rows.reduce((sum, row) => sum + Number(row.total_revenue ?? 0), 0)) },
  ],
}

const expenses: LiveReportDefinition = {
  title: 'Expense Report', filename: 'expense',
  columns: [
    { key: 'expense_date', header: 'Date', value: (row) => formatReportDate(row.expense_date) },
    { key: 'category', header: 'Category', value: (row) => text(row.category) },
    { key: 'description', header: 'Description', value: (row) => text(row.description) },
    { key: 'amount', header: 'Amount', value: (row) => money(row.amount) },
  ],
  summaries: (rows) => [
    { label: 'Expenses', value: rows.length },
    { label: 'Total Expenses', value: money(rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0)) },
  ],
}

const licences: LiveReportDefinition = {
  title: 'Licence Status Report', filename: 'licence-status',
  columns: [
    { key: 'student_number', header: 'Student No.', value: (row) => text(row.student_number) },
    { key: 'student_name', header: 'Name', value: (row) => text(row.student_name) },
    { key: 'enrolment_type', header: 'Enrolment', value: (row) => text(row.enrolment_type) },
    { key: 'eye_test_date', header: 'Eye Test', value: (row) => row.eye_test_done ? `Done — ${formatReportDate(row.eye_test_date)}` : 'Pending' },
    { key: 'learner_licence_date', header: 'Learner Licence', value: (row) => row.learner_licence_issued ? `Issued — ${formatReportDate(row.learner_licence_date)}` : 'Pending' },
    { key: 'exam_date', header: 'Exam Date', value: (row) => formatReportDate(row.exam_date) },
    { key: 'licence_issued_date', header: 'Full Licence', value: (row) => row.licence_issued ? `Issued — ${formatReportDate(row.licence_issued_date)}` : 'Pending' },
  ],
  summaries: (rows) => [
    { label: 'Licence Students', value: rows.length },
    { label: 'Learner Issued', value: rows.filter((row) => Boolean(row.learner_licence_issued)).length },
    { label: 'Awaiting Full Licence', value: rows.filter((row) => Boolean(row.learner_licence_issued) && !row.licence_issued).length },
    { label: 'Full Licence Issued', value: rows.filter((row) => Boolean(row.licence_issued)).length },
  ],
}

export const REPORT_DEFINITIONS: Record<LiveReportKind, LiveReportDefinition> = {
  students, attendance, revenue, expenses, licences,
}
