import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioDAO } from '../dao/usuario.dao';
import { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario, GoogleUserInfo, UsuarioResponse } from '../models/types';
import { config } from '../config/env';
import { RolUsuario } from '../models/enums';
import { HttpError, UnauthorizedError, ConflictError } from '../middlewares/errorHandler';
import {
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  sendVerificationEmail,
} from './emailVerification.service';

export class UsuarioService {
  async getAll(): Promise<UsuarioResponse[]> {
    const usuarios = await usuarioDAO.findAll();
    return usuarios.map(u => this.sinPassword(u));
  }

  async getAllPaginated(page: number, limit: number): Promise<{ usuarios: UsuarioResponse[]; total: number; pages: number }> {
    const [usuarios, total] = await Promise.all([
      usuarioDAO.findAllPaginated(page, limit),
      usuarioDAO.countAll(),
    ]);
    return {
      usuarios: usuarios.map(u => this.sinPassword(u)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getById(id: string): Promise<UsuarioResponse | null> {
    const usuario = await usuarioDAO.findById(id);
    if (!usuario) return null;
    return this.sinPassword(usuario);
  }

  async getByEmail(email: string): Promise<UsuarioResponse[]> {
    const usuarios = await usuarioDAO.findByEmail(email);
    return usuarios.map(u => this.sinPassword(u));
  }

  async getByRol(rol: 'dueno' | 'inquilino'): Promise<UsuarioResponse[]> {
    const usuarios = await usuarioDAO.findByRol(rol);
    return usuarios.map(u => this.sinPassword(u));
  }

  async create(data: CreateUsuarioDTO): Promise<{ token: string; user: UsuarioResponse }> {
    // Check if email already exists
    const existing = await usuarioDAO.findByCorreo(data.correo);
    if (existing) {
      throw new ConflictError('El correo electrónico ya está registrado');
    }

    // Hash password (required for /auth/registro; controller validates min length)
    if (!data.contrasena) {
      throw new HttpError('La contraseña es requerida para el registro', 400);
    }
    const hashedPassword = await bcrypt.hash(data.contrasena, 10);

    // Generate next ID
    const id = await usuarioDAO.getNextId();

    try {
      await usuarioDAO.create({
        nombre: data.nombre,
        correo: data.correo,
        contrasena: hashedPassword,
        rol: data.rol,
        telefono: data.telefono,
        id,
      });
    } catch (error) {
      // Handle UNIQUE constraint violation from race condition (mssql error 2627 / 2601)
      const err = error as { number?: number; code?: string; message?: string };
      const isUniqueViolation =
        err?.number === 2627 ||
        err?.number === 2601 ||
        (typeof err?.message === 'string' && /unique/i.test(err.message));
      if (isUniqueViolation) {
        throw new ConflictError('El correo electrónico ya está registrado');
      }
      throw error;
    }

    const usuario = await usuarioDAO.findById(id);
    if (!usuario) {
      throw new HttpError('Error al crear usuario', 500);
    }

    // Immediately sign in the new user (same as login)
    return this.finalizeGoogleLogin(usuario);
  }

  async update(id: string, data: UpdateUsuarioDTO): Promise<boolean> {
    if (data.correo) {
      const existing = await usuarioDAO.findByCorreoExcludingId(data.correo, id);
      if (existing) {
        throw new ConflictError('El correo electrónico ya está registrado');
      }
    }
    return usuarioDAO.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return usuarioDAO.delete(id);
  }

  async login(correo: string, contrasena: string): Promise<{ token: string; user: UsuarioResponse }> {
    const usuario = await usuarioDAO.findByCorreo(correo);
    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // OAuth users cannot login with password
    if (!usuario.ContrasenaHash) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(contrasena, usuario.ContrasenaHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        id: usuario.Id,
        correo: usuario.Correo,
        rol: usuario.Rol,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    await usuarioDAO.updateLastLogin(usuario.Id);

    return {
      token,
      user: this.sinPassword(usuario),
    };
  }

  async getProfile(id: string): Promise<UsuarioResponse | null> {
    const usuario = await usuarioDAO.findById(id);
    if (!usuario) return null;
    return this.sinPassword(usuario);
  }

  async refreshToken(id: string): Promise<{ token: string; user: UsuarioResponse }> {
    const usuario = await usuarioDAO.findById(id);
    if (!usuario) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    const token = jwt.sign(
      { id: usuario.Id, correo: usuario.Correo, rol: usuario.Rol },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    return { token, user: this.sinPassword(usuario) };
  }

  async verifyEmail(token: string): Promise<{ userId: string; correo: string }> {
    const { userId, correo } = verifyEmailVerificationToken(token);
    const usuario = await usuarioDAO.findById(userId);
    if (!usuario) {
      throw new UnauthorizedError('Usuario no encontrado');
    }
    // TODO (Phase 5): add emailVerificado column to Usuarios table and set it to true here
    // await usuarioDAO.setEmailVerificado(userId, true);
    return { userId, correo };
  }

  async sendVerificationEmail(userId: string, correo: string): Promise<void> {
    const usuario = await usuarioDAO.findById(userId);
    if (!usuario) {
      throw new UnauthorizedError('Usuario no encontrado');
    }
    const token = generateEmailVerificationToken(userId, correo);
    const frontendBaseUrl = config.emailVerification?.frontendBaseUrl || 'https://arrendacr.com';
    const verificationUrl = `${frontendBaseUrl}/verify-email?token=${token}`;
    await sendVerificationEmail(correo, usuario.Nombre, verificationUrl);
  }

  async googleLogin(googleUser: GoogleUserInfo, rol?: RolUsuario): Promise<{ token: string; user: UsuarioResponse }> {
    const email = googleUser.email.toLowerCase().trim();

    // 1) Prefer lookup by GoogleId to avoid duplicates if the user changed their Google email
    let usuario = await usuarioDAO.findByGoogleId(googleUser.googleId);

    if (usuario) {
      // Existing Google-linked user — login directly
      return this.finalizeGoogleLogin(usuario);
    }

    // 2) No match by GoogleId — try matching by email
    const existingByEmail = await usuarioDAO.findByCorreo(email);

    if (existingByEmail) {
      // Takeover protection: if this user is already linked to a different GoogleId, refuse.
      if (existingByEmail.GoogleId && existingByEmail.GoogleId !== googleUser.googleId) {
        throw new UnauthorizedError('Esta cuenta ya está vinculada a otra cuenta de Google');
      }

      // Link the GoogleId (and avatar if missing) to the existing account.
      await usuarioDAO.setGoogleProfile(existingByEmail.Id, googleUser.googleId, googleUser.picture ?? null);
      const refreshed = await usuarioDAO.findById(existingByEmail.Id);
      if (!refreshed) {
        throw new HttpError('Error al vincular cuenta de Google', 500);
      }
      usuario = refreshed;
    } else {
      // 3) Brand new Google user — create with provided rol (default DUENO)
      const id = await usuarioDAO.getNextId();
      try {
        await usuarioDAO.create({
          nombre: googleUser.name,
          correo: email,
          contrasena: undefined,
          rol: rol || RolUsuario.DUENO,
          telefono: undefined,
          avatar: googleUser.picture,
          googleId: googleUser.googleId,
          id,
        });
      } catch (error) {
        const err = error as { number?: number; message?: string };
        const isUniqueViolation =
          err?.number === 2627 ||
          err?.number === 2601 ||
          (typeof err?.message === 'string' && /unique/i.test(err.message));
        if (isUniqueViolation) {
          throw new ConflictError('El correo electrónico ya está registrado');
        }
        throw error;
      }
      const created = await usuarioDAO.findById(id);
      if (!created) {
        throw new HttpError('Error al crear usuario de Google', 500);
      }
      usuario = created;
    }

    return this.finalizeGoogleLogin(usuario);
  }

  private async finalizeGoogleLogin(usuario: Usuario): Promise<{ token: string; user: UsuarioResponse }> {
    const token = jwt.sign(
      { id: usuario.Id, correo: usuario.Correo, rol: usuario.Rol },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    await usuarioDAO.updateLastLogin(usuario.Id);

    return { token, user: this.sinPassword(usuario) };
  }

  private sinPassword(usuario: Usuario): UsuarioResponse {
    const { ContrasenaHash: _hash, ...rest } = usuario;
    // Convert to camelCase for API response
    return {
      id: rest.Id,
      nombre: rest.Nombre,
      correo: rest.Correo,
      rol: rest.Rol,
      telefono: rest.Telefono,
      avatar: rest.Avatar,
      fechaRegistro: rest.FechaRegistro,
      ultimoLogin: rest.UltimoLogin,
    };
  }
}

export const usuarioService = new UsuarioService();