import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createStudentSchema, updateStudentSchema } from '../schemas';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(createStudentSchema), studentController.create);
router.get('/', studentController.list);
// Static path must precede the `/:id` param route, or "licences" is read as an id.
router.get('/licences', studentController.listLicences);
router.get('/:id', studentController.getById);
router.patch('/:id', validateBody(updateStudentSchema), studentController.update);
router.patch('/:id/package', studentController.assignPackage);
router.patch('/:id/licence', studentController.updateLicence);

export default router;
