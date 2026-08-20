import { Router } from 'express';
import * as leadController from '../controllers/leadController';
import { authenticate } from '../middleware/auth';
import { publicFlowLimiter } from '../middleware/rateLimit';

const router = Router();

// Public QR self-submission — no auth. A prospective student scans a
// QR code and submits just their name + phone before ever having an
// account. Rate-limited to curb spam submissions.
router.post('/', publicFlowLimiter, leadController.submit);

router.use(authenticate);

router.get('/', leadController.list);
router.patch('/:id/complete', leadController.complete);

export default router;
