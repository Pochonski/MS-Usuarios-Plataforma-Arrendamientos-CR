import { Router } from 'express';
import { propiedadController } from '../controllers/propiedad.controller';
import { authenticate } from '../middlewares/auth';
import { validate, propiedadValidation } from '../middlewares/validation';

const router = Router();

router.get('/propiedades', propiedadController.getAll);
router.get('/propiedades/:id', propiedadController.getById);
router.post('/propiedades', authenticate, propiedadValidation.create, validate, propiedadController.create);
router.put('/propiedades/:id', authenticate, validate, propiedadController.update);
router.delete('/propiedades/:id', authenticate, propiedadController.delete);

export default router;