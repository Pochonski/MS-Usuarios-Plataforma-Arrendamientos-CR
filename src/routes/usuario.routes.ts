import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { validate, usuarioValidation } from '../middlewares/validation';

const router = Router();

// Auth routes (public)
router.post('/auth/login', usuarioValidation.login, validate, usuarioController.login);

// User routes
router.get('/usuarios', optionalAuth, usuarioController.getAll);
router.get('/usuario/:id', optionalAuth, usuarioController.getById);
router.post('/usuario/:tempId', validate, usuarioController.create);
router.put('/usuario/:id', authenticate, validate, usuarioController.update);

// Profile (protected)
router.get('/auth/profile', authenticate, usuarioController.getProfile);

export default router;