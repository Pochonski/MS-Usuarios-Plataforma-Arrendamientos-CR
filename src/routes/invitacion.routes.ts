import { Router } from 'express';
import { invitacionController } from '../controllers/invitacion.controller';
import { authenticate } from '../middlewares/auth';
import { validate, invitacionValidation } from '../middlewares/validation';

const router = Router();

router.get('/invitaciones', authenticate, invitacionController.getAll);
router.get('/invitaciones/:id', authenticate, invitacionController.getById);
router.post('/invitaciones', authenticate, invitacionValidation.create, validate, invitacionController.create);
router.put('/invitaciones/:id', authenticate, validate, invitacionController.update);

export default router;