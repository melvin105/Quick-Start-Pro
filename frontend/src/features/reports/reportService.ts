import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'

export type LiveReportKind = 'students' | 'attendance' | 'revenue' | 'expenses' | 'licences'
export type ReportRow = Record<string, string | number | boolean | null>

export async function getLiveReport(kind: LiveReportKind, from: string, to: string, status?: string): Promise<ReportRow[]> {
  try {
    if (kind === 'revenue') {
      const { data } = await api.get<ReportRow[]>('/reports/revenue', { params: { from, to } })
      return data
    }
    if (kind === 'licences') {
      const { data } = await api.get<ReportRow[]>('/reports/dvla', { params: { from, to, ...(status ? { status } : {}) } })
      return data
    }
    const { data } = await api.get<{ rows: ReportRow[] }>(`/reports/${kind}`, { params: { from, to } })
    return data.rows
  } catch (error) {
    throw toApiError(error)
  }
}
