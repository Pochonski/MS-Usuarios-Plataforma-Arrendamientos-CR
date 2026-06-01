import { RolUsuario } from './enums';

// User model (matches SQL column names)
export interface Usuario {
  Id: string;               // Format: usr-001, usr-002, etc.
  Nombre: string;
  Correo: string;
  ContrasenaHash: string | null;
  Rol: RolUsuario;
  Avatar?: string;
  Telefono?: string;
  FechaRegistro: Date;
  UltimoLogin?: Date;
  GoogleId?: string;
}

// DTOs for API requests (camelCase for external API)
export interface CreateUsuarioDTO {
  nombre: string;
  correo: string;
  contrasena?: string;
  rol: RolUsuario;
  telefono?: string;
}

export interface UpdateUsuarioDTO {
  nombre?: string;
  correo?: string;
  telefono?: string;
  avatar?: string;
}

// API Error response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Google OAuth user info from verified token
export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}