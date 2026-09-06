import { Router } from 'express';
import * as schedulingController from '../controllers/schedulingController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Manager and secretary can both view the grid and manage assignments —
// mirrors the RLS model (schedule_slots: secretary read-only; slot_assignments:
// secretary read + write). Slots themselves are pre-seeded and not edited here.
router.get('/slots', requireRole('manager', 'secretary'), schedulingController.list);
router.post('/slots/:slotId/assignments', requireRole('manager', 'secretary'), schedulingController.assign);
router.post('/assignments/move', requireRole('manager', 'secretary'), schedulingController.move);
router.post(
  '/slots/:slotId/apply-days',
  requireRole('manager', 'secretary'),
  schedulingController.applyToDays,
);
router.post(
  '/slots/:slotId/remove-days',
  requireRole('manager', 'secretary'),
  schedulingController.removeFromDays,
);
router.delete(
  '/slots/:slotId/assignments/:studentId',
  requireRole('manager', 'secretary'),
  schedulingController.unassign,
);

export default router;
