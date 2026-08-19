import { Router } from 'express';
import * as registrationController from '../controllers/registrationController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public full self-registration — no auth. A prospective student scans the
// QR code, fills in the whole form, and it lands in the pending queue.
// Mirrors the public leads route (public POST registered before authenticate).
router.post('/', registrationController.submit);

router.use(authenticate);

// The pending queue is worked by both roles — the secretary adds enrolment at
// approval, the manager oversees. Matches the leads queue's permissiveness.
router.get('/', requireRole('manager', 'secretary'), registrationController.list);
router.post('/invite', requireRole('manager', 'secretary'), registrationController.createInvitation);
router.post('/:id/approve', requireRole('manager', 'secretary'), registrationController.approve);
router.post('/:id/reject', requireRole('manager', 'secretary'), registrationController.reject);

export default router;
