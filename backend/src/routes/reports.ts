import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('manager'));

router.get('/revenue', reportController.revenue);
router.get('/dvla', reportController.dvla);

export default router;
