import { RolUsuario } from './enums';

// User model (matches EF Core entity)
export interface Usuario {
  id: string;               // Format: usr-001, usr-002, etc.
  nombre: string;
  correo: string;
  contrasenaHash: string;
  rol: RolUsuario;
  avatar?: string;
  telefono?: string;
  fechaRegistro: Date;
  ultimoLogin?: Date;
}

// DTOs for API requests
export interface CreateUsuarioDTO {
  nombre: string;
  correo: string;
  contrasena: string;
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