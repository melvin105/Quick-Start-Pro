import { Router } from 'express';
import * as leadController from '../controllers/leadController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public QR self-submission — no auth. A prospective student scans a
// QR code and submits just their name + phone before ever having an
// account.
router.post('/', leadController.submit);

router.use(authenticate);

router.get('/', leadController.list);
router.patch('/:id/complete', leadController.complete);

export default router;
