import { contratoDAO } from '../dao/contrato.dao';
import { CreateContratoDTO, UpdateContratoDTO, Contrato } from '../models/types';
import { EstadoContrato } from '../models/enums';

export class ContratoService {
  async getAll(): Promise<Contrato[]> {
    return contratoDAO.findAll();
  }

  async getById(id: number): Promise<Contrato | null> {
    return contratoDAO.findById(id);
  }

  async getByInquilino(inquilinoId: number): Promise<Contrato[]> {
    return contratoDAO.findByInquilino(inquilinoId);
  }

  async getByDueno(duenoId: number): Promise<Contrato[]> {
    return contratoDAO.findByDueno(duenoId);
  }

  async getByPropiedad(propiedadId: number): Promise<Contrato[]> {
    return contratoDAO.findByPropiedad(propiedadId);
  }

  async getActivosByInquilino(inquilinoId: number): Promise<Contrato[]> {
    return contratoDAO.findActivosByInquilino(inquilinoId);
  }

  async create(data: CreateContratoDTO): Promise<{ id: number; contrato: Contrato }> {
    const id = await contratoDAO.create(data);
    const contrato = await contratoDAO.findById(id);

    if (!contrato) {
      throw new Error('Error al crear contrato');
    }

    return { id, contrato };
  }

  async update(id: number, data: UpdateContratoDTO): Promise<boolean> {
    const contrato = await contratoDAO.findById(id);
    if (!contrato) {
      throw new Error('Contrato no encontrado');
    }

    return contratoDAO.update(id, data);
  }

  async activate(id: number): Promise<boolean> {
    return contratoDAO.update(id, { estado: EstadoContrato.ACTIVO });
  }

  async finalize(id: number): Promise<boolean> {
    return contratoDAO.update(id, { estado: EstadoContrato.FINALIZADO });
  }

  async cancel(id: number): Promise<boolean> {
    return contratoDAO.update(id, { estado: EstadoContrato.CANCELADO });
  }

  async delete(id: number): Promise<boolean> {
    const contrato = await contratoDAO.findById(id);
    if (!contrato) {
      throw new Error('Contrato no encontrado');
    }

    return contratoDAO.delete(id);
  }
}

export const contratoService = new ContratoService();