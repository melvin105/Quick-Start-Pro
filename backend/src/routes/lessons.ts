import { Router } from 'express';
import * as lessonController from '../controllers/lessonController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', lessonController.create);
router.get('/', lessonController.list);
router.patch('/:id', lessonController.update);

export default router;
