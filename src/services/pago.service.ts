import { pagoDAO } from '../dao/pago.dao';
import { CreatePagoDTO, UpdatePagoDTO, Pago } from '../models/types';
import { EstadoPago } from '../models/enums';

export class PagoService {
  async getAll(): Promise<Pago[]> {
    return pagoDAO.findAll();
  }

  async getById(id: number): Promise<Pago | null> {
    return pagoDAO.findById(id);
  }

  async getByUser(userId: number): Promise<Pago[]> {
    return pagoDAO.findByUser(userId);
  }

  async getByContrato(contratoId: number): Promise<Pago[]> {
    return pagoDAO.findByContrato(contratoId);
  }

  async getByMesAnio(mes: number, año: number, contratoId?: number): Promise<Pago[]> {
    return pagoDAO.findByMesAnio(mes, año, contratoId);
  }

  async create(data: CreatePagoDTO): Promise<{ id: number; pago: Pago }> {
    const id = await pagoDAO.create(data);
    const pago = await pagoDAO.findById(id);

    if (!pago) {
      throw new Error('Error al crear pago');
    }

    return { id, pago };
  }

  async update(id: number, data: UpdatePagoDTO): Promise<boolean> {
    const pago = await pagoDAO.findById(id);
    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    return pagoDAO.update(id, data);
  }

  async approve(id: number): Promise<boolean> {
    return pagoDAO.update(id, {
      estado: EstadoPago.APROBADO,
      fechaRevision: new Date(),
    });
  }

  async reject(id: number, motivo: string): Promise<boolean> {
    return pagoDAO.update(id, {
      estado: EstadoPago.RECHAZADO,
      fechaRevision: new Date(),
      motivoRechazo: motivo,
    });
  }

  async delete(id: number): Promise<boolean> {
    const pago = await pagoDAO.findById(id);
    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    return pagoDAO.delete(id);
  }
}

export const pagoService = new PagoService();