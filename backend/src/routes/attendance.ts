import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', attendanceController.mark);
router.get('/', attendanceController.list);

export default router;
