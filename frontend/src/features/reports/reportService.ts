import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'

export type LiveReportKind = 'students' | 'attendance' | 'revenue' | 'expenses' | 'schedule'
export type ReportRow = Record<string, string | number | null>

export async function getLiveReport(kind: LiveReportKind, from: string, to: string): Promise<ReportRow[]> {
  try {
    if (kind === 'revenue') {
      const { data } = await api.get<ReportRow[]>('/reports/revenue', { params: { from: from.slice(0, 7), to: to.slice(0, 7) } })
      return data
    }
    const { data } = await api.get<{ rows: ReportRow[] }>(`/reports/${kind}`, { params: { from, to } })
    return data.rows
  } catch (error) {
    throw toApiError(error)
  }
}
