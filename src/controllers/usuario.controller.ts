import { Request, Response } from 'express';
import { usuarioService } from '../services/usuario.service';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from '../models/types';
import { AuthRequest } from '../middlewares/auth';

export class UsuarioController {
  // GET /usuarios (búsqueda por email)
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.query;
      if (email && typeof email === 'string') {
        const usuarios = await usuarioService.getByEmail(email);
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
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

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

  // POST /usuario/:tempId (registro - tempId es placeholder)
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUsuarioDTO = req.body;
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
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

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
}

export const usuarioController = new UsuarioController();