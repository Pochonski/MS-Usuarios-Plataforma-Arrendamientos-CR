import { Response } from 'express';
import { conversacionService, mensajeService } from '../services/chat.service';
import { AuthRequest } from '../middlewares/auth';

export class ConversacionController {
  // GET /conversaciones
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const conversaciones = await conversacionService.getAll();
      res.json(conversaciones);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /conversaciones/:id
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const conversacion = await conversacionService.getById(id);
      if (!conversacion) {
        res.status(404).json({ error: 'Not Found', message: 'Conversación no encontrada' });
        return;
      }

      res.json(conversacion);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /conversaciones/user/:userId
  async getByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const conversaciones = await conversacionService.getByUser(userId);
      res.json(conversaciones);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // POST /conversaciones
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await conversacionService.createOrGet(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }
}

export class MensajeController {
  // GET /mensajes
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const mensajes = await mensajeService.getAll();
      res.json(mensajes);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /mensajes/:id
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const mensaje = await mensajeService.getById(id);
      if (!mensaje) {
        res.status(404).json({ error: 'Not Found', message: 'Mensaje no encontrado' });
        return;
      }

      res.json(mensaje);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /mensajes/user/:userId
  async getByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const mensajes = await mensajeService.getByUser(userId);
      res.json(mensajes);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // POST /mensajes
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await mensajeService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // PUT /mensajes/:id
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const { status } = req.body;
      if (!status) {
        res.status(400).json({ error: 'Validation Error', message: 'Campo status es requerido' });
        return;
      }

      const success = await mensajeService.update(id, { status });
      if (!success) {
        res.status(404).json({ error: 'Not Found', message: 'Mensaje no encontrado' });
        return;
      }

      const mensaje = await mensajeService.getById(id);
      res.json(mensaje);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }
}

export const conversacionController = new ConversacionController();
export const mensajeController = new MensajeController();