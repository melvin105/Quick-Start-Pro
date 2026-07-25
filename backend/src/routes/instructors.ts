import { Router } from 'express';
import * as instructorController from '../controllers/instructorController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('manager'), instructorController.create);
router.get('/', instructorController.list);
router.get('/:id', instructorController.getById);
router.patch('/:id', requireRole('manager'), instructorController.update);
router.get('/:id/lessons', instructorController.lessons);

export default router;
