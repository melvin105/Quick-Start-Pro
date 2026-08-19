import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimit';
import { loginLockout } from '../middleware/loginLockout';
import { validateBody } from '../middleware/validate';
import { loginBodySchema } from '../schemas';

const router = Router();

// Order matters: the lockout check runs first so an already-locked IP is turned
// away immediately (and without spending its rate-limit budget); the limiter is
// the broader per-IP cap; then the controller. The lockout hooks the response
// to count failures/successes itself.
router.post('/login', loginLockout.middleware, loginLimiter, validateBody(loginBodySchema), authController.login);
// No `authenticate` here: the refresh token in the body IS the credential, and
// the access token is expected to be expired by the time this is called. The
// service verifies the refresh token and rotates it. Rate-limited like login to
// blunt brute-forcing / rotation abuse.
router.post('/refresh', loginLimiter, authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;
