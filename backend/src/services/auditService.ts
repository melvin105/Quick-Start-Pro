import { pool } from '../db';
import { ApiError } from '../utils/ApiError';

const AUDITED_TABLES = ['students', 'payments', 'staff', 'licence_tracking', 'expenses', 'student_packages'] as const;
const ACTIONS = ['INSERT', 'UPDATE', 'DELETE'] as const;

export interface ListAuditLogsQuery {
  tableName?: string;
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

function assertTableName(value: string): void {
  if (!(AUDITED_TABLES as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `tableName must be one of: ${AUDITED_TABLES.join(', ')}`);
  }
}

function assertAction(value: string): void {
  if (!(ACTIONS as readonly string[]).includes(value)) {
    throw new ApiError(400, 'INVALID_INPUT', `action must be one of: ${ACTIONS.join(', ')}`);
  }
}

export async function listAuditLogs(query: ListAuditLogsQuery) {
  const { tableName, action, userId, dateFrom, dateTo } = query;
  if (tableName) assertTableName(tableName);
  if (action) assertAction(action);

  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 20;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (tableName) {
    params.push(tableName);
    conditions.push(`al.table_name = $${params.length}`);
  }
  if (action) {
    params.push(action);
    conditions.push(`al.action = $${params.length}`);
  }
  if (userId) {
    params.push(userId);
    conditions.push(`al.user_id = $${params.length}`);
  }
  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`al.created_at >= $${params.length}`);
  }
  if (dateTo) {
    params.push(dateTo);
    conditions.push(`al.created_at <= $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(' and ')}` : '';
  const baseFrom = `
    from public.audit_logs al
    left join public.users u on u.id = al.user_id
    left join public.staff sf on sf.id = u.staff_id
  `;

  const { rows: countRows } = await pool.query(`select count(*)::int as total ${baseFrom} ${where}`, params);
  const total = countRows[0].total;

  params.push(limit, offset);
  const { rows } = await pool.query(
    `select
       al.id, al.table_name, al.record_id, al.action, al.old_data, al.new_data, al.created_at,
       al.user_id, u.email as user_email, u.role as user_role,
       sf.first_name || ' ' || sf.last_name as user_name
     ${baseFrom}
     ${where}
     order by al.created_at desc
     limit $${params.length - 1} offset $${params.length}`,
    params,
  );

  return { logs: rows, total, page, limit };
}
