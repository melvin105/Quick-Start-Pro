import { Router } from 'express';
import * as receiptController from '../controllers/receiptController';

const router = Router();

router.get('/:id', receiptController.getById);

export default router;
