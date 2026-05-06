import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

// Validate request
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Datos de entrada inválidos',
      details: errors.array(),
    });
    return;
  }
  next();
};

// User validation rules
export const usuarioValidation = {
  login: [
    body('correo').isEmail().withMessage('Correo electrónico inválido'),
    body('contrasena').notEmpty().withMessage('La contraseña es requerida'),
  ],
  create: [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('correo').isEmail().withMessage('Correo electrónico inválido'),
    body('contrasena').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol').isIn(['dueno', 'inquilino']).withMessage('Rol debe ser "dueno" o "inquilino"'),
    body('telefono').trim().notEmpty().withMessage('El teléfono es requerido'),
  ],
  update: [
    body('nombre').optional().trim().notEmpty(),
    body('correo').optional().isEmail(),
    body('telefono').optional().trim().notEmpty(),
  ],
};