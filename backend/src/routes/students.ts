import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', studentController.create);
router.get('/', studentController.list);
router.get('/:id', studentController.getById);
router.patch('/:id', studentController.update);

export default router;
