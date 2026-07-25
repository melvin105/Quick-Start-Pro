import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', paymentController.create);
router.get('/', paymentController.list);
router.get('/:studentId', paymentController.history);
router.patch('/:id', paymentController.update);

export default router;
