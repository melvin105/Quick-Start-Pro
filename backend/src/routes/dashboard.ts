import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Both roles get a dashboard; the service tailors the payload (manager-only
// finance figures and the monthly revenue series are omitted for secretaries).
router.get('/', requireRole('manager', 'secretary'), dashboardController.get);

export default router;
