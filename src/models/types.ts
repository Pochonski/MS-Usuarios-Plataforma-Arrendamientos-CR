import {
  RolUsuario,
  TipoPropiedad,
  EstadoPropiedad,
  EstadoContrato,
  EstadoDeposito,
  EstadoPago,
  TipoPago,
  TipoConversacion,
  TipoNotificacion,
  TipoMensaje,
  EstadoMensaje,
} from './enums';

// Base interface for all entities
export interface BaseEntity {
  id: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

// User model
export interface Usuario extends BaseEntity {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: RolUsuario;
  telefono: string;
  fechaRegistro: Date;
  propiedades?: number[];
  propiedadesCompartidas?: number[];
}

// Property model
export interface Propiedad extends BaseEntity {
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: string;
  provincia: string;
  canton: string;
  distrito: string;
  tipo: TipoPropiedad;
  estado: EstadoPropiedad;
  imagenes: string[];
  idDueno: number;
  amenidades: string[];
}

// Invitation model
export interface Invitacion extends BaseEntity {
  propiedadId: number;
  duenoId: number;
  inquilinoCorreo: string;
  montoAlquiler: number;
  montoDeposito: number;
  moneda: string;
  estado: string;
}

// Contract model
export interface Contrato extends BaseEntity {
  invitacionId: number;
  propiedadId: number;
  duenoId: number;
  inquilinoId: number;
  montoMensual: number;
  montoDeposito: number;
  moneda: string;
  fechaInicio: Date;
  estado: EstadoContrato;
  estadoDeposito: EstadoDeposito;
}

// Payment model
export interface Pago extends BaseEntity {
  tipo: TipoPago;
  idContrato: number;
  idPropiedad: number;
  idDueno: number;
  idInquilino: number;
  mes: number;
  año: number;
  monto: number;
  moneda: string;
  comprobante: string;
  estado: EstadoPago;
  fechaSubida: Date;
  fechaRevision?: Date;
  motivoRechazo?: string;
}

// Notification model
export interface Notificacion extends BaseEntity {
  userId: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
  link?: string;
}

// Conversation model
export interface Conversacion extends BaseEntity {
  participants: number[];
  propertyId?: number;
  type: TipoConversacion;
}

// Message model
export interface Mensaje extends BaseEntity {
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  type: TipoMensaje;
  status: EstadoMensaje;
  fecha: Date;
}

// DTOs for API requests
export interface CreateUsuarioDTO {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: RolUsuario;
  telefono: string;
  propiedades?: number[];
}

export interface UpdateUsuarioDTO {
  nombre?: string;
  correo?: string;
  telefono?: string;
}

export interface CreatePropiedadDTO {
  titulo: string;
  descripcion: string;
  precio: number;
  moneda: string;
  provincia: string;
  canton: string;
  distrito: string;
  tipo: TipoPropiedad;
  estado?: EstadoPropiedad;
  imagenes: string[];
  idDueno: number;
  amenidades: string[];
}

export interface UpdatePropiedadDTO {
  titulo?: string;
  descripcion?: string;
  precio?: number;
  moneda?: string;
  provincia?: string;
  canton?: string;
  distrito?: string;
  tipo?: TipoPropiedad;
  estado?: EstadoPropiedad;
  imagenes?: string[];
  amenidades?: string[];
}

export interface CreateInvitacionDTO {
  propiedadId: number;
  duenoId: number;
  inquilinoCorreo: string;
  montoAlquiler: number;
  montoDeposito: number;
  moneda: string;
}

export interface UpdateInvitacionDTO {
  estado?: string;
}

export interface CreateContratoDTO {
  invitacionId: number;
  propiedadId: number;
  duenoId: number;
  inquilinoId: number;
  montoMensual: number;
  montoDeposito: number;
  moneda: string;
  fechaInicio: Date;
  estado?: EstadoContrato;
  estadoDeposito?: EstadoDeposito;
}

export interface UpdateContratoDTO {
  estado?: EstadoContrato;
  estadoDeposito?: EstadoDeposito;
}

export interface CreatePagoDTO {
  tipo: TipoPago;
  idContrato: number;
  idPropiedad: number;
  idDueno: number;
  idInquilino: number;
  mes: number;
  año: number;
  monto: number;
  moneda: string;
  comprobante: string;
  estado?: EstadoPago;
  fechaSubida: Date;
}

export interface UpdatePagoDTO {
  estado?: EstadoPago;
  fechaRevision?: Date;
  motivoRechazo?: string;
}

export interface CreateNotificacionDTO {
  userId: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida?: boolean;
  fecha: Date;
  link?: string;
}

export interface UpdateNotificacionDTO {
  leida: boolean;
}

export interface CreateConversacionDTO {
  participants: number[];
  propertyId?: number;
  type: TipoConversacion;
}

export interface CreateMensajeDTO {
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  type?: TipoMensaje;
}

export interface UpdateMensajeDTO {
  status: EstadoMensaje;
}

// Pagination response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Error response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}