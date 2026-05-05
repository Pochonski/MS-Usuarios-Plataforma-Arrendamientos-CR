import { Response } from 'express';
import { pagoService } from '../services/pago.service';
import { AuthRequest } from '../middlewares/auth';

export class PagoController {
  // GET /pagos
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const pagos = await pagoService.getAll();
      res.json(pagos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /pagos/:id
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const pago = await pagoService.getById(id);
      if (!pago) {
        res.status(404).json({ error: 'Not Found', message: 'Pago no encontrado' });
        return;
      }

      res.json(pago);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /pagos/user/:userId
  async getByUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const pagos = await pagoService.getByUser(userId);
      res.json(pagos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // POST /pagos
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await pagoService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // PUT /pagos/:id
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const success = await pagoService.update(id, req.body);
      if (!success) {
        res.status(404).json({ error: 'Not Found', message: 'Pago no encontrado' });
        return;
      }

      const pago = await pagoService.getById(id);
      res.json(pago);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }
}

export const pagoController = new PagoController();