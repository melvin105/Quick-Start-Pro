import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as recordsController from '../controllers/recordsController';

const router = Router();
router.use(authenticate);
router.get('/', requireRole('manager', 'secretary'), recordsController.daily);

export default router;
