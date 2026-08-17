import { Router } from 'express';
import * as checkinController from '../controllers/checkinController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/token', authenticate, requireRole('manager', 'secretary'), checkinController.token);

// Public QR self check-in — no auth. Students have no login accounts; they
// scan the signed daily QR code, look themselves up by phone, optionally pick their
// instructor, and mark themselves present. Mirrors the public leads route.
router.get('/instructors', checkinController.instructors);
router.post('/lookup', checkinController.lookup);
router.post('/', checkinController.checkIn);

export default router;
