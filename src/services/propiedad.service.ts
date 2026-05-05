import { propiedadDAO } from '../dao/propiedad.dao';
import { CreatePropiedadDTO, UpdatePropiedadDTO, PaginatedResponse, Propiedad } from '../models/types';

export class PropiedadService {
  async getAll(
    page: number = 1,
    limit: number = 10,
    filters: {
      search?: string;
      provincia?: string;
      tipo?: string;
      precioMin?: number;
      precioMax?: number;
      duenoId?: number;
    } = {}
  ): Promise<PaginatedResponse<Propiedad>> {
    return propiedadDAO.findAll(page, limit, filters);
  }

  async getById(id: number): Promise<Propiedad | null> {
    return propiedadDAO.findById(id);
  }

  async create(data: CreatePropiedadDTO): Promise<{ id: number; propiedad: Propiedad }> {
    const id = await propiedadDAO.create(data);
    const propiedad = await propiedadDAO.findById(id);

    if (!propiedad) {
      throw new Error('Error al crear propiedad');
    }

    return { id, propiedad };
  }

  async update(id: number, data: UpdatePropiedadDTO): Promise<boolean> {
    const propiedad = await propiedadDAO.findById(id);
    if (!propiedad) {
      throw new Error('Propiedad no encontrada');
    }

    return propiedadDAO.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    const propiedad = await propiedadDAO.findById(id);
    if (!propiedad) {
      throw new Error('Propiedad no encontrada');
    }

    return propiedadDAO.delete(id);
  }
}

export const propiedadService = new PropiedadService();