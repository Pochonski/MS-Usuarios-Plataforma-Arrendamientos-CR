import { Router } from 'express';
import { pagoController } from '../controllers/pago.controller';
import { authenticate } from '../middlewares/auth';
import { validate, pagoValidation } from '../middlewares/validation';

const router = Router();

router.get('/pagos', authenticate, pagoController.getAll);
router.get('/pagos/user/:userId', authenticate, pagoController.getByUser);
router.get('/pagos/:id', authenticate, pagoController.getById);
router.post('/pagos', authenticate, pagoValidation.create, validate, pagoController.create);
router.put('/pagos/:id', authenticate, validate, pagoController.update);

export default router;