import { Router } from 'express';
import * as endOfDayController from '../controllers/endOfDayController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', endOfDayController.list);
// role_permissions: records.submit_end_of_day is secretary-only,
// records.approve_close_day is manager-only.
router.post('/submit', requireRole('secretary'), endOfDayController.submit);
router.post('/approve', requireRole('manager'), endOfDayController.approve);

export default router;
