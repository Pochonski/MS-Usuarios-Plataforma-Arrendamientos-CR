import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { usuarioService } from '../services/usuario.service';
import { googleService } from '../services/google.service';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from '../models/types';
import { AuthRequest } from '../middlewares/auth';
import { HttpError } from '../middlewares/errorHandler';
import { config } from '../config/env';

export class UsuarioController {
  // GET /usuarios (búsqueda por email, rol o paginación)
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { email, rol, page, limit } = req.query;

      if (email && typeof email === 'string') {
        const usuarios = await usuarioService.getByEmail(email);
        res.json(usuarios);
      } else if (rol && typeof rol === 'string') {
        const usuarios = await usuarioService.getByRol(rol as 'dueno' | 'inquilino');
        res.json(usuarios);
      } else {
        const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
        const result = await usuarioService.getAllPaginated(pageNum, limitNum);
        res.json({
          data: result.usuarios,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: result.total,
            pages: result.pages,
          },
        });
      }
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /usuario/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const usuario = await usuarioService.getById(id);
      if (!usuario) {
        res.status(404).json({ error: 'Not Found', message: 'Usuario no encontrado' });
        return;
      }

      res.json(usuario);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /usuario (registro)
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Normalize field names from frontend (Google OAuth sends different names)
      const rawData = req.body;
      const data: CreateUsuarioDTO = {
        nombre: (rawData.Nombre || rawData.nombre || '').trim(),
        correo: (rawData.Correo || rawData.email || rawData.correo || '').toLowerCase().trim(),
        contrasena: rawData.Contraseña || rawData.contrasena || '',
        rol: rawData.Rol || rawData.rol || 'dueno',
        telefono: rawData.Telefono || rawData.telefono || '',
      };

      const result = await usuarioService.create(data);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // PUT /usuario/:id
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      // Verificar que el usuario autenticado solo pueda actualizar su propio perfil
      if (req.user && req.user.id !== id) {
        res.status(403).json({ error: 'Forbidden', message: 'No puedes actualizar otro usuario' });
        return;
      }

      const data: UpdateUsuarioDTO = req.body;
      const success = await usuarioService.update(id, data);

      if (!success) {
        res.status(404).json({ error: 'Not Found', message: 'Usuario no encontrado' });
        return;
      }

      const usuario = await usuarioService.getById(id);
      res.json(usuario);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /auth/login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { correo, contrasena } = req.body;

      if (!correo || !contrasena) {
        res.status(400).json({ error: 'Validation Error', message: 'Correo y contraseña son requeridos' });
        return;
      }

      const normalizedCorreo = String(correo).toLowerCase().trim();
      const result = await usuarioService.login(normalizedCorreo, contrasena);
      res.json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // GET /auth/profile
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No autenticado' });
        return;
      }

      const usuario = await usuarioService.getProfile(req.user.id);
      if (!usuario) {
        res.status(404).json({ error: 'Not Found', message: 'Usuario no encontrado' });
        return;
      }

      res.json(usuario);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /auth/refresh
  async refresh(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No autenticado' });
        return;
      }

      // Extract refresh token from body or header
      const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'] as string;
      let refreshJti: string | undefined;

      if (refreshToken) {
        try {
          const decoded = jwt.decode(refreshToken) as { jti?: string } | null;
          refreshJti = decoded?.jti;
        } catch {
          // Invalid refresh token, proceed without revocation
        }
      }

      const result = await usuarioService.refreshToken(req.user.id, refreshJti);
      res.json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /auth/logout (Phase 5)
  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No autenticado' });
        return;
      }

      // Extract the token's jti and exp from the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized', message: 'Token no proporcionado' });
        return;
      }

      const token = authHeader.substring(7);
      let jti: string | undefined;
      let exp: number | undefined;

      try {
        const decoded = jwt.decode(token) as { jti?: string; exp?: number } | null;
        jti = decoded?.jti;
        exp = decoded?.exp;
      } catch {
        // Token decoding failed, but we still proceed (logout will just not revoke)
      }

      // Revoke the access token
      if (jti) {
        await usuarioService.logout(jti, exp);
      }

      res.json({ message: 'Logout exitoso. Sesión revocada.' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /auth/google
  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { googleToken, rol, nonce } = req.body;
      // hd from config is the authoritative allowed domain; frontend can send it but config overrides
      const hd = config.google.allowedDomain || req.body.hd;

      const googleUser = await googleService.verifyToken(googleToken, { nonce, hd: hd || undefined });
      const result = await usuarioService.googleLogin(googleUser, rol);
      res.json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /auth/verify-email/:token
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      if (!token) {
        res.status(400).json({ error: 'Validation Error', message: 'Token requerido' });
        return;
      }

      const { userId, correo } = await usuarioService.verifyEmail(token);
      res.json({ message: 'Email verificado exitosamente', userId, correo });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // POST /auth/send-verification-email
  async sendVerificationEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'No autenticado' });
        return;
      }

      await usuarioService.sendVerificationEmail(req.user.id, req.user.correo);
      res.json({ message: 'Email de verificación enviado' });
    } catch (error) {
      this.handleError(res, error);
    }
  }
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      // Verificar que el usuario autenticado solo pueda eliminar su propia cuenta
      if (req.user && req.user.id !== id) {
        res.status(403).json({ error: 'Forbidden', message: 'No puedes eliminar otro usuario' });
        return;
      }

      const success = await usuarioService.delete(id);

      if (!success) {
        res.status(404).json({ error: 'Not Found', message: 'Usuario no encontrado' });
        return;
      }

      res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown): void {
    const isHttpError = error instanceof HttpError;
    const statusCode = isHttpError ? error.statusCode : 500;
    const errorName = isHttpError ? error.name : 'Error';
    const message = error instanceof Error ? error.message : 'Error desconocido';

    // Phase 5: Handle lockout errors with extra info
    const lockoutError = error as { blockedUntil?: Date; intentosFallidos?: number; intentosRestantes?: number };
    const response: Record<string, unknown> = { error: errorName, message };
    if (lockoutError.blockedUntil) {
      response.blockedUntil = lockoutError.blockedUntil;
    }
    if (lockoutError.intentosFallidos !== undefined) {
      response.intentosFallidos = lockoutError.intentosFallidos;
    }
    if (lockoutError.intentosRestantes !== undefined) {
      response.intentosRestantes = lockoutError.intentosRestantes;
    }

    res.status(statusCode).json(response);
  }
}

export const usuarioController = new UsuarioController();