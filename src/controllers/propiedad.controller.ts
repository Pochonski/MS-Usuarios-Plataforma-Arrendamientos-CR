import { Request, Response } from 'express';
import { propiedadService } from '../services/propiedad.service';
import { AuthRequest } from '../middlewares/auth';

export class PropiedadController {
  // GET /propiedades
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const filters = {
        search: req.query.search as string,
        provincia: req.query.provincia as string,
        tipo: req.query.tipo as string,
        precioMin: req.query.precioMin ? parseFloat(req.query.precioMin as string) : undefined,
        precioMax: req.query.precioMax ? parseFloat(req.query.precioMax as string) : undefined,
        duenoId: req.query.duenoId ? parseInt(req.query.duenoId as string, 10) : undefined,
      };

      const result = await propiedadService.getAll(page, limit, filters);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /propiedades/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const propiedad = await propiedadService.getById(id);
      if (!propiedad) {
        res.status(404).json({ error: 'Not Found', message: 'Propiedad no encontrada' });
        return;
      }

      res.json(propiedad);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // POST /propiedades
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await propiedadService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // PUT /propiedades/:id
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const success = await propiedadService.update(id, req.body);
      if (!success) {
        res.status(404).json({ error: 'Not Found', message: 'Propiedad no encontrada' });
        return;
      }

      const propiedad = await propiedadService.getById(id);
      res.json(propiedad);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // DELETE /propiedades/:id
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const success = await propiedadService.delete(id);
      if (!success) {
        res.status(404).json({ error: 'Not Found', message: 'Propiedad no encontrada' });
        return;
      }

      res.status(200).json({ message: 'Propiedad eliminada correctamente' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }
}

export const propiedadController = new PropiedadController();