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
    body('nombre')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
    body('correo').isEmail().withMessage('Correo electrónico inválido'),
    body('contrasena').optional(),
    body('rol')
      .isIn(['dueno', 'inquilino'])
      .withMessage('Rol debe ser "dueno" o "inquilino"'),
    body('telefono')
      .optional()
      .matches(/^\+?[0-9]{8,12}$/)
      .withMessage('Teléfono inválido (8-12 dígitos, opcional +506)'),
  ],
  update: [
    body('nombre')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('El nombre debe tener entre 1 y 100 caracteres'),
    body('correo').optional().isEmail().withMessage('Correo electrónico inválido'),
    body('telefono')
      .optional()
      .trim()
      .matches(/^\+?[0-9]{8,12}$/)
      .withMessage('Teléfono inválido (8-12 dígitos, opcional +506)'),
  ],
  google: [
    body('googleToken').notEmpty().withMessage('Token de Google es requerido'),
    body('rol')
      .optional()
      .isIn(['dueno', 'inquilino'])
      .withMessage('Rol debe ser "dueno" o "inquilino"'),
  ],
};