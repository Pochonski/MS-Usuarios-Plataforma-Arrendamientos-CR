import { Router } from 'express';
import { contratoController } from '../controllers/contrato.controller';
import { authenticate } from '../middlewares/auth';
import { validate, contratoValidation } from '../middlewares/validation';

const router = Router();

router.get('/contratos', authenticate, contratoController.getAll);
router.get('/contratos/:id', authenticate, contratoController.getById);
router.get('/contratos/inquilino/:inquilinoId', authenticate, contratoController.getByInquilino);
router.post('/contratos', authenticate, contratoValidation.create, validate, contratoController.create);
router.put('/contratos/:id', authenticate, validate, contratoController.update);

export default router;