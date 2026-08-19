import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../schemas';

const router = Router();

router.use(authenticate);

// User (login account) administration is manager-only — the Staff/Settings
// admin area. Instructors are staff records without logins, so accounts are
// limited to the manager and secretary roles (enforced in the service).
router.use(requireRole('manager'));

router.get('/', userController.list);
router.post('/', validateBody(createUserSchema), userController.create);
router.patch('/:id', validateBody(updateUserSchema), userController.update);

export default router;
