import { Router } from 'express';
import * as checkinController from '../controllers/checkinController';
import { authenticate, requireRole } from '../middleware/auth';
import { publicFlowLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/token', authenticate, requireRole('manager', 'secretary'), checkinController.token);

// Public QR self check-in — no auth. Students have no login accounts; they
// scan the signed daily QR code, look themselves up by phone, optionally pick their
// instructor, and mark themselves present. Mirrors the public leads route.
// Rate-limited to cap phone-number enumeration via /lookup (see rateLimit.ts;
// the limit is kiosk-friendly for a shared school IP).
router.get('/instructors', publicFlowLimiter, checkinController.instructors);
router.post('/lookup', publicFlowLimiter, checkinController.lookup);
router.post('/', publicFlowLimiter, checkinController.checkIn);

export default router;
