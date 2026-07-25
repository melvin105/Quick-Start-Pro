import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', paymentController.create);
router.get('/', paymentController.list);
router.get('/:studentId', paymentController.history);
// #21: trg_auto_receipt issues a receipt synchronously on every insert, so a
// payment is never "receipted later" — it's receipted immediately. Manager-only
// per the considered decision that payments become immutable once receipted;
// see supabase/migrations/20260725000010_payment_immutability.sql.
router.patch('/:id', requireRole('manager'), paymentController.update);

export default router;
