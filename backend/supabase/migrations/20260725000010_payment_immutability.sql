-- ============================================================
-- DrivePro / Quick Start Pro — 10_payment_immutability.sql  (run TENTH)
-- Resolves issue #21: payments become immutable once a receipt is
-- issued. Since trg_auto_receipt (migration 02) fires synchronously
-- on every payments insert, a payment is never in a "receipted later"
-- state — it is receipted immediately, so this is enforced as
-- "secretary can no longer edit a payment after creation."
--
-- RLS is not the enforcement layer for this backend (Express uses a
-- raw pg connection and checks roles in middleware), so the actual
-- gate is requireRole('manager') on PATCH /api/v1/payments/:id.
-- This migration only brings role_permissions — which drives
-- frontend show/hide — back in sync with that decision.
-- ============================================================

update public.role_permissions
set allowed = false
where role = 'secretary' and permission_key = 'payments.edit';
