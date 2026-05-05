import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, body, param, query } from 'express-validator';

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

// Property validation rules
export const propiedadValidation = {
  create: [
    body('titulo').trim().notEmpty().withMessage('El título es requerido'),
    body('descripcion').trim().notEmpty().withMessage('La descripción es requerida'),
    body('precio').isNumeric().withMessage('El precio debe ser numérico'),
    body('moneda').trim().notEmpty().withMessage('La moneda es requerida'),
    body('provincia').trim().notEmpty().withMessage('La provincia es requerida'),
    body('canton').trim().notEmpty().withMessage('El cantón es requerido'),
    body('distrito').trim().notEmpty().withMessage('El distrito es requerido'),
    body('tipo').isIn(['casa', 'apartamento', 'terreno', 'comercial']).withMessage('Tipo de propiedad inválido'),
    body('idDueno').isNumeric().withMessage('ID del dueño es requerido'),
    body('amenidades').isArray().withMessage('Las amenidades deben ser un array'),
  ],
  update: [
    body('titulo').optional().trim().notEmpty(),
    body('descripcion').optional().trim().notEmpty(),
    body('precio').optional().isNumeric(),
    body('amenidades').optional().isArray(),
  ],
};

// Invitation validation rules
export const invitacionValidation = {
  create: [
    body('propiedadId').isNumeric().withMessage('ID de propiedad es requerido'),
    body('duenoId').isNumeric().withMessage('ID del dueño es requerido'),
    body('inquilinoCorreo').isEmail().withMessage('Correo del inquilino es requerido'),
    body('montoAlquiler').isNumeric().withMessage('Monto de alquiler debe ser numérico'),
    body('montoDeposito').isNumeric().withMessage('Monto de depósito debe ser numérico'),
    body('moneda').trim().notEmpty().withMessage('La moneda es requerida'),
  ],
  update: [
    body('estado').optional().isIn(['pendiente', 'aceptada', 'rechazada']).withMessage('Estado inválido'),
  ],
};

// Contract validation rules
export const contratoValidation = {
  create: [
    body('invitacionId').isNumeric().withMessage('ID de invitación es requerido'),
    body('propiedadId').isNumeric().withMessage('ID de propiedad es requerido'),
    body('duenoId').isNumeric().withMessage('ID del dueño es requerido'),
    body('inquilinoId').isNumeric().withMessage('ID del inquilino es requerido'),
    body('montoMensual').isNumeric().withMessage('Monto mensual debe ser numérico'),
    body('montoDeposito').isNumeric().withMessage('Monto de depósito debe ser numérico'),
    body('moneda').trim().notEmpty().withMessage('La moneda es requerida'),
    body('fechaInicio').isISO8601().withMessage('Fecha de inicio inválida'),
  ],
  update: [
    body('estado').optional().isIn(['en_proceso', 'activo', 'finalizado', 'cancelado']),
    body('estadoDeposito').optional().isIn(['pendiente', 'pagado', 'devuelto']),
  ],
};

// Payment validation rules
export const pagoValidation = {
  create: [
    body('tipo').isIn(['mensualidad', 'deposito']).withMessage('Tipo de pago inválido'),
    body('idContrato').isNumeric().withMessage('ID de contrato es requerido'),
    body('idPropiedad').isNumeric().withMessage('ID de propiedad es requerido'),
    body('idDueno').isNumeric().withMessage('ID del dueño es requerido'),
    body('idInquilino').isNumeric().withMessage('ID del inquilino es requerido'),
    body('mes').isInt({ min: 1, max: 12 }).withMessage('Mes debe estar entre 1 y 12'),
    body('año').isInt({ min: 2020 }).withMessage('Año inválido'),
    body('monto').isNumeric().withMessage('Monto debe ser numérico'),
    body('moneda').trim().notEmpty().withMessage('La moneda es requerida'),
    body('comprobante').notEmpty().withMessage('El comprobante es requerido'),
  ],
  update: [
    body('estado').optional().isIn(['pendiente', 'aprobado', 'rechazado']),
    body('motivoRechazo').optional().trim(),
  ],
};

// Notification validation rules
export const notificacionValidation = {
  create: [
    body('userId').isNumeric().withMessage('ID de usuario es requerido'),
    body('tipo').isIn(['invitacion', 'pago', 'contrato', 'mensaje', 'sistema']).withMessage('Tipo de notificación inválido'),
    body('titulo').trim().notEmpty().withMessage('El título es requerido'),
    body('mensaje').trim().notEmpty().withMessage('El mensaje es requerido'),
  ],
  update: [
    body('leida').isBoolean().withMessage('El campo leida debe ser boolean'),
  ],
};

// Conversation validation rules
export const conversacionValidation = {
  create: [
    body('participants').isArray({ min: 2 }).withMessage('Participants debe ser un array con al menos 2 elementos'),
    body('type').isIn(['consulta_propiedad', 'contrato_activo', 'pago_comprobante', 'general']).withMessage('Tipo de conversación inválido'),
  ],
};

// Message validation rules
export const mensajeValidation = {
  create: [
    body('conversationId').isNumeric().withMessage('ID de conversación es requerido'),
    body('senderId').isNumeric().withMessage('ID del remitente es requerido'),
    body('receiverId').isNumeric().withMessage('ID del receptor es requerido'),
    body('content').trim().notEmpty().withMessage('El contenido es requerido'),
  ],
  update: [
    body('status').optional().isIn(['enviado', 'leido']).withMessage('Estado de mensaje inválido'),
  ],
};