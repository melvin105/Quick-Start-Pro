import { Router } from 'express';
import * as packageController from '../controllers/packageController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Read access matches RLS (mgr_pkgs full access, sec_pkgs_read select-only):
// both roles need the package list for the registration/enrolment dropdown.
router.get('/', packageController.list);
router.get('/:id', packageController.getById);

// Fee management is manager-only per #54 and role_permissions
// (settings.manage_packages) — see supabase/migrations/20260725000011_package_settings_permission.sql.
router.post('/', requireRole('manager'), packageController.create);
router.patch('/:id', requireRole('manager'), packageController.update);
router.delete('/:id', requireRole('manager'), packageController.remove);

export default router;
