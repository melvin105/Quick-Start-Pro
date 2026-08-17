import api from '../../lib/api'
import { toApiError } from '../../lib/apiError'
import type { ActionType, AuditEntry, AuditFieldChange, AuditModule, AuditRole } from './types'

interface ApiAuditLog {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
  user_email: string | null
  user_name: string | null
  user_role: 'manager' | 'secretary' | null
}

const MODULES: Record<string, AuditModule> = {
  students: 'Students', payments: 'Payments', staff: 'Staff',
  licence_tracking: 'Students', expenses: 'Finances', student_packages: 'Finances',
}

function fields(value: Record<string, unknown> | null, keys: string[]): AuditFieldChange[] | undefined {
  if (!value) return undefined
  return keys.map((field) => ({ field, value: String(value[field] ?? '—') }))
}

function mapLog(row: ApiAuditLog): AuditEntry {
  const actionType: ActionType = row.action === 'INSERT' ? 'create' : row.action === 'DELETE' ? 'delete' : 'edit'
  const beforeData = row.old_data ?? {}
  const afterData = row.new_data ?? {}
  const changed = Array.from(new Set([...Object.keys(beforeData), ...Object.keys(afterData)]))
    .filter((key) => key !== 'updated_at' && JSON.stringify(beforeData[key]) !== JSON.stringify(afterData[key]))
  const record = row.new_data ?? row.old_data
  return {
    id: row.id,
    timestamp: row.created_at,
    user: row.user_name?.trim() || row.user_email || 'System',
    role: row.user_role ? `${row.user_role[0].toUpperCase()}${row.user_role.slice(1)}` as AuditRole : 'Manager',
    action: `${row.action === 'INSERT' ? 'Created' : row.action === 'DELETE' ? 'Deleted' : 'Updated'} ${row.table_name.replaceAll('_', ' ')}`,
    actionType,
    module: MODULES[row.table_name] ?? 'Auth',
    detail: {
      record: `${row.table_name.replaceAll('_', ' ')} · ${row.record_id}`,
      before: fields(row.old_data, changed),
      after: fields(row.new_data, changed),
      linkStudentId: row.table_name === 'students' ? String(record?.id ?? row.record_id) : undefined,
    },
  }
}

export async function listAuditLogs(dateFrom?: string): Promise<AuditEntry[]> {
  try {
    const { data } = await api.get<{ logs: ApiAuditLog[] }>('/audit', { params: { dateFrom, limit: 100 } })
    return data.logs.map(mapLog)
  } catch (error) {
    throw toApiError(error)
  }
}
