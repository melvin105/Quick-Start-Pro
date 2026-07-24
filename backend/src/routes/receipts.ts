import { Router } from 'express';
import * as receiptController from '../controllers/receiptController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:id', receiptController.getById);

export default router;
