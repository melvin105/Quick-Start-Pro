import { Router } from 'express';
import * as expenseController from '../controllers/expenseController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// The secretary records daily expenses from the Records screen and can revise
// or remove them while the day is still open (the end-of-day close lock then
// freezes them via trg_lock_expenses → 423 DAY_LOCKED). The manager reviews
// the ledger but does not record expenses, so reads are open to both roles
// while writes are secretary-only.
router.get('/', requireRole('manager', 'secretary'), expenseController.list);
router.post('/', requireRole('secretary'), expenseController.create);
router.patch('/:id', requireRole('secretary'), expenseController.update);
router.delete('/:id', requireRole('secretary'), expenseController.remove);

export default router;
