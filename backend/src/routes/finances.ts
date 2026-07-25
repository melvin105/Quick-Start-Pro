import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('manager'));

router.get('/', reportController.finances);

export default router;
