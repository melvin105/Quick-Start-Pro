import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Both login roles have their own notification feed. `/read-all` is declared
// before `/:id/read` so the literal path isn't captured by the :id param.
router.get('/', requireRole('manager', 'secretary'), notificationController.list);
router.patch('/read-all', requireRole('manager', 'secretary'), notificationController.markAllRead);
router.patch('/:id/read', requireRole('manager', 'secretary'), notificationController.markRead);

export default router;
