import { Request, Response } from 'express';
import { usuarioService } from '../services/usuario.service';
import { googleService } from '../services/google.service';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from '../models/types';
import { AuthRequest } from '../middlewares/auth';
import { HttpError } from '../middlewares/errorHandler';

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
        nombre: rawData.Nombre || rawData.nombre,
        correo: rawData.Correo || rawData.email || rawData.correo,
        contrasena: rawData.Contraseña || rawData.contrasena || '',
        rol: rawData.Rol || rawData.rol || 'dueno',
        telefono: rawData.Telefono || rawData.telefono || '',
      };

      const result = await usuarioService.create(data);
      res.status(201).json(result.usuario);
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

      const result = await usuarioService.login(correo, contrasena);
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

  // POST /auth/google
  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { googleToken, rol } = req.body;

      const googleUser = await googleService.verifyToken(googleToken);
      const result = await usuarioService.googleLogin(googleUser, rol);
      res.json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // DELETE /usuario/:id
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
    res.status(statusCode).json({ error: errorName, message });
  }
}

export const usuarioController = new UsuarioController();