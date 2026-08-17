import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', studentController.create);
router.get('/', studentController.list);
// Static path must precede the `/:id` param route, or "licences" is read as an id.
router.get('/licences', studentController.listLicences);
router.get('/:id', studentController.getById);
router.patch('/:id', studentController.update);
router.patch('/:id/licence', studentController.updateLicence);

export default router;
