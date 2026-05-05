import { Response } from 'express';
import { contratoService } from '../services/contrato.service';
import { AuthRequest } from '../middlewares/auth';

export class ContratoController {
  // GET /contratos
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const contratos = await contratoService.getAll();
      res.json(contratos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /contratos/:id
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const contrato = await contratoService.getById(id);
      if (!contrato) {
        res.status(404).json({ error: 'Not Found', message: 'Contrato no encontrado' });
        return;
      }

      res.json(contrato);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // GET /contratos/inquilino/:inquilinoId
  async getByInquilino(req: AuthRequest, res: Response): Promise<void> {
    try {
      const inquilinoId = parseInt(req.params.inquilinoId, 10);
      if (isNaN(inquilinoId)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const contratos = await contratoService.getByInquilino(inquilinoId);
      res.json(contratos);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // POST /contratos
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await contratoService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }

  // PUT /contratos/:id
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Validation Error', message: 'ID inválido' });
        return;
      }

      const success = await contratoService.update(id, req.body);
      if (!success) {
        res.status(404).json({ error: 'Not Found', message: 'Contrato no encontrado' });
        return;
      }

      const contrato = await contratoService.getById(id);
      res.json(contrato);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: 'Server Error', message });
    }
  }
}

export const contratoController = new ContratoController();