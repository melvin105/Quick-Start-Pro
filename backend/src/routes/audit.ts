import { Router } from 'express';
import * as auditController from '../controllers/auditController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(requireRole('manager'));

router.get('/', auditController.list);

export default router;
