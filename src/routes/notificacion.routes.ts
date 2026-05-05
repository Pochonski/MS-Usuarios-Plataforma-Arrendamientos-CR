import { Router } from 'express';
import { notificacionController } from '../controllers/notificacion.controller';
import { authenticate } from '../middlewares/auth';
import { validate, notificacionValidation } from '../middlewares/validation';

const router = Router();

router.get('/notificaciones', authenticate, notificacionController.getAll);
router.get('/notificaciones/user/:userId', authenticate, notificacionController.getByUser);
router.get('/notificaciones/:id', authenticate, notificacionController.getById);
router.post('/notificaciones', authenticate, notificacionValidation.create, validate, notificacionController.create);
router.put('/notificaciones/:id', authenticate, validate, notificacionController.update);

export default router;