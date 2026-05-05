// User roles
export enum RolUsuario {
  DUENO = 'dueno',
  INQUILINO = 'inquilino',
}

// Property types
export enum TipoPropiedad {
  CASA = 'casa',
  APARTAMENTO = 'apartamento',
  TERRENO = 'terreno',
  COMERCIAL = 'comercial',
}

// Property status
export enum EstadoPropiedad {
  DISPONIBLE = 'disponible',
  OCUPADA = 'ocupada',
  MANTENIMIENTO = 'mantenimiento',
}

// Contract status
export enum EstadoContrato {
  EN_PROCESO = 'en_proceso',
  ACTIVO = 'activo',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

// Deposit status
export enum EstadoDeposito {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
  DEVUELTO = 'devuelto',
}

// Payment status
export enum EstadoPago {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}

// Payment types
export enum TipoPago {
  MENSUALIDAD = 'mensualidad',
  DEPOSITO = 'deposito',
}

// Conversation types
export enum TipoConversacion {
  CONSULTA_PROPIEDAD = 'consulta_propiedad',
  CONTRATO_ACTIVO = 'contrato_activo',
  PAGO_COMPROBANTE = 'pago_comprobante',
  GENERAL = 'general',
}

// Notification types
export enum TipoNotificacion {
  INVITACION = 'invitacion',
  PAGO = 'pago',
  CONTRATO = 'contrato',
  MENSAJE = 'mensaje',
  SISTEMA = 'sistema',
}

// Message types
export enum TipoMensaje {
  TEXT = 'text',
  IMAGE = 'image',
}

// Message status
export enum EstadoMensaje {
  ENVIADO = 'enviado',
  LEIDO = 'leido',
}