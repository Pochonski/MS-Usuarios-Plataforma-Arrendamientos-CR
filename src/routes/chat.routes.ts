import { Router } from 'express';
import { conversacionController, mensajeController } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth';
import { validate, conversacionValidation, mensajeValidation } from '../middlewares/validation';

const router = Router();

// Conversaciones
router.get('/conversaciones', authenticate, conversacionController.getAll);
router.get('/conversaciones/user/:userId', authenticate, conversacionController.getByUser);
router.get('/conversaciones/:id', authenticate, conversacionController.getById);
router.post('/conversaciones', authenticate, conversacionValidation.create, validate, conversacionController.create);

// Mensajes
router.get('/mensajes', authenticate, mensajeController.getAll);
router.get('/mensajes/user/:userId', authenticate, mensajeController.getByUser);
router.get('/mensajes/:id', authenticate, mensajeController.getById);
router.post('/mensajes', authenticate, mensajeValidation.create, validate, mensajeController.create);
router.put('/mensajes/:id', authenticate, validate, mensajeController.update);

export default router;