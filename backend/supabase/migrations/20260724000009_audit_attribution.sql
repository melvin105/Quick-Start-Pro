-- ============================================================
-- 09_audit_attribution.sql
-- The Express backend connects via a plain pg pool with its own
-- JWT/bcrypt auth (ADR-003/ADR-004), bypassing Supabase Auth
-- entirely. auth.uid() reads a GUC that only PostgREST/Supabase's
-- client sets, so it always resolves to NULL through our connection
-- and audit_logs.user_id would silently stay NULL for every write
-- we make. Attribute writes via an app-level GUC instead, set
-- transaction-locally by Express (see backend/src/db.ts
-- withUserContext) around each authenticated write.
-- ============================================================

create or replace function public.audit_changes()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.audit_logs (user_id, table_name, record_id, action, old_data, new_data)
  values (
    nullif(current_setting('app.current_user_id', true), '')::uuid,
    tg_table_name,
    coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id')),
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;
