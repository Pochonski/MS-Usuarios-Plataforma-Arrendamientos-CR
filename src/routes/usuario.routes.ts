import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { validate, usuarioValidation } from '../middlewares/validation';
import { rateLimitAuth, rateLimitRead, rateLimitWrite } from '../middlewares/rateLimit';

const router = Router();

// Auth routes (public) - strict rate limiting
router.post('/auth/login', rateLimitAuth, usuarioValidation.login, validate, usuarioController.login);
router.post('/auth/registro', rateLimitAuth, usuarioValidation.create, validate, usuarioController.create);
router.post('/auth/google', rateLimitAuth, usuarioValidation.google, validate, usuarioController.googleLogin);

// Read endpoints - lenient rate limiting
router.get('/usuarios', rateLimitRead, optionalAuth, usuarioController.getAll);
router.get('/usuario/:id', rateLimitRead, optionalAuth, usuarioController.getById);

// Write endpoints - moderate rate limiting
router.put('/usuario/:id', rateLimitWrite, authenticate, usuarioValidation.update, validate, usuarioController.update);

// Profile (protected) - read rate limiting
router.get('/auth/profile', rateLimitRead, authenticate, usuarioController.getProfile);

export default router;