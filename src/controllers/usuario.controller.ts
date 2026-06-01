import { Request, Response } from 'express';
import { usuarioService } from '../services/usuario.service';
import { googleService } from '../services/google.service';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from '../models/types';
import { AuthRequest } from '../middlewares/auth';

export class UsuarioController {
  // GET /usuarios (búsqueda por email o rol)
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { email, rol } = req.query;
      if (email && typeof email === 'string') {
        const usuarios = await usuarioService.getByEmail(email);
        res.json(usuarios);
      } else if (rol && typeof rol === 'string') {
        const usuarios = await usuarioService.getByRol(rol as 'dueno' | 'inquilino');
        res.json(usuarios);
      } else {
        const usuarios = await usuarioService.getAll();
        res.json(usuarios);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
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
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
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
      res.status(201).json({ id: result.id, ...result.usuario });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      if (message.includes('ya está registrado')) {
        res.status(409).json({ error: 'Conflict', message });
        return;
      }
      res.status(500).json({ error: 'Server Error', message });
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
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
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
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(401).json({ error: 'Unauthorized', message });
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
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // POST /auth/google
  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { googleToken } = req.body;

      const googleUser = await googleService.verifyToken(googleToken);
      const result = await usuarioService.googleLogin(googleUser);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(401).json({ error: 'Unauthorized', message });
    }
  }
}

export const usuarioController = new UsuarioController();