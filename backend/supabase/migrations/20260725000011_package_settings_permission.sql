-- ============================================================
-- DrivePro / Quick Start Pro — 11_package_settings_permission.sql  (run ELEVENTH)
-- Resolves issue #54: package fee management (Driving+Licence, Driving
-- Only, Licence Only prices) is manager-only. RLS already reflects this
-- (mgr_pkgs is `for all`, sec_pkgs_read is `select`-only), so this
-- migration brings role_permissions — which drives frontend show/hide —
-- in sync with the same decision, enforced at the Express layer via
-- requireRole('manager') on POST/PATCH/DELETE /api/v1/packages.
-- ============================================================

insert into public.role_permissions (role, permission_key, allowed, requires_logging) values
  ('manager',   'settings.manage_packages', true,  false),
  ('secretary', 'settings.manage_packages', false, false)
on conflict (role, permission_key) do nothing;
