import { Response } from 'express';
import { notificacionService } from '../services/notificacion.service';
import { AuthRequest } from '../middlewares/auth';

export class NotificacionController {
  // GET /notificaciones
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const notificaciones = await notificacionService.getAll();
      res.json(notificaciones);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /notificaciones/:id
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const notificacion = await notificacionService.getById(id);
      if (!notificacion) {
        res.status(404).json({ error: 'Not Found', message: 'Notificación no encontrada' });
        return;
      }

      res.json(notificacion);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /notificaciones/user/:userId
  async getByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const notificaciones = await notificacionService.getByUser(userId);
      res.json(notificaciones);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // POST /notificaciones
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await notificacionService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // PUT /notificaciones/:id
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const { leida } = req.body;
      let success: boolean;

      if (leida === true) {
        success = await notificacionService.markAsRead(id);
      } else if (leida === false) {
        success = await notificacionService.markAsUnread(id);
      } else {
        res.status(400).json({ error: 'Validation Error', message: 'Campo leida es requerido' });
        return;
      }

      if (!success) {
        res.status(404).json({ error: 'Not Found', message: 'Notificación no encontrada' });
        return;
      }

      const notificacion = await notificacionService.getById(id);
      res.json(notificacion);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }
}

export const notificacionController = new NotificacionController();