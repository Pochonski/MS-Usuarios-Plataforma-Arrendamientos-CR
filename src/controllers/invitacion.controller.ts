import { Response } from 'express';
import { invitacionService } from '../services/invitacion.service';
import { AuthRequest } from '../middlewares/auth';

export class InvitacionController {
  // GET /invitaciones
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const invitaciones = await invitacionService.getAll();
      res.json(invitaciones);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /invitaciones/:id
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const invitacion = await invitacionService.getById(id);
      if (!invitacion) {
        res.status(404).json({ error: 'Not Found', message: 'Invitación no encontrada' });
        return;
      }

      res.json(invitacion);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // POST /invitaciones
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await invitacionService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // PUT /invitaciones/:id
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const success = await invitacionService.update(id, req.body);
      if (!success) {
        res.status(404).json({ error: 'Not Found', message: 'Invitación no encontrada' });
        return;
      }

      const invitacion = await invitacionService.getById(id);
      res.json(invitacion);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }
}

export const invitacionController = new InvitacionController();