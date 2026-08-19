import { Router } from 'express';
import * as receiptController from '../controllers/receiptController';
import { receiptLimiter } from '../middleware/rateLimit';

const router = Router();

// Public, login-free receipt link — rate-limited to stop scraping / UUID
// guessing (see receiptLimiter). The controller also sets no-store + noindex.
router.get('/:id', receiptLimiter, receiptController.getById);

export default router;
