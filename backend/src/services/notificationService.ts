import { pool } from '../db';
import { ApiError } from '../utils/ApiError';

// Notifications service — thin queries over the `notifications` table (see
// migration 4 / 00_ALL_IN_ONE.sql). We connect via a plain pg pool (auth.uid()
// is always NULL here), so the "who may see this" rule from the RLS policy is
// enforced in SQL instead: a row reaches a user when it's addressed to them
// directly (recipient_user) or broadcast to their role (recipient_role).

export interface Recipient {
  userId: string;
  role: 'manager' | 'secretary';
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NOTIFICATION_SELECT = `
  select id, recipient_role, recipient_user, type, title, body, link_url, is_read, created_at
  from public.notifications
`;

// The bell panel and Notifications page both read this: the recipient's newest
// notifications (capped so the panel stays light) plus a total unread count so
// the badge is accurate even past the cap.
export async function listForRecipient(recipient: Recipient) {
  const { rows } = await pool.query(
    `${NOTIFICATION_SELECT}
      where recipient_user = $1 or recipient_role = $2
      order by created_at desc
      limit 50`,
    [recipient.userId, recipient.role],
  );

  const unread = await pool.query(
    `select count(*)::int as count from public.notifications
      where (recipient_user = $1 or recipient_role = $2) and is_read = false`,
    [recipient.userId, recipient.role],
  );

  return { notifications: rows, unreadCount: unread.rows[0]?.count ?? 0 };
}

// Mark one notification read. Scoped to the recipient so a user can't flip a
// notification that isn't addressed to them (a missing/foreign id is a 404).
export async function markRead(id: string, recipient: Recipient): Promise<void> {
  if (!UUID_RE.test(id)) {
    throw new ApiError(400, 'INVALID_INPUT', 'Invalid notification id.');
  }
  const { rows } = await pool.query(
    `update public.notifications set is_read = true
      where id = $1 and (recipient_user = $2 or recipient_role = $3)
      returning id`,
    [id, recipient.userId, recipient.role],
  );
  if (!rows[0]) {
    throw new ApiError(404, 'NOT_FOUND', 'Notification not found.');
  }
}

// Clear the recipient's unread badge in one shot. Returns how many were flipped.
export async function markAllRead(recipient: Recipient): Promise<number> {
  const { rowCount } = await pool.query(
    `update public.notifications set is_read = true
      where (recipient_user = $1 or recipient_role = $2) and is_read = false`,
    [recipient.userId, recipient.role],
  );
  return rowCount ?? 0;
}
