import { invitacionDAO } from '../dao/invitacion.dao';
import { CreateInvitacionDTO, UpdateInvitacionDTO, Invitacion } from '../models/types';

export class InvitacionService {
  async getAll(): Promise<Invitacion[]> {
    return invitacionDAO.findAll();
  }

  async getById(id: number): Promise<Invitacion | null> {
    return invitacionDAO.findById(id);
  }

  async getByPropiedad(propiedadId: number): Promise<Invitacion[]> {
    return invitacionDAO.findByPropiedad(propiedadId);
  }

  async getByDueno(duenoId: number): Promise<Invitacion[]> {
    return invitacionDAO.findByDueno(duenoId);
  }

  async getByInquilinoCorreo(correo: string): Promise<Invitacion[]> {
    return invitacionDAO.findByInquilinoCorreo(correo);
  }

  async create(data: CreateInvitacionDTO): Promise<{ id: number; invitacion: Invitacion }> {
    const id = await invitacionDAO.create(data);
    const invitacion = await invitacionDAO.findById(id);

    if (!invitacion) {
      throw new Error('Error al crear invitación');
    }

    return { id, invitacion };
  }

  async update(id: number, data: UpdateInvitacionDTO): Promise<boolean> {
    const invitacion = await invitacionDAO.findById(id);
    if (!invitacion) {
      throw new Error('Invitación no encontrada');
    }

    return invitacionDAO.update(id, data);
  }

  async accept(id: number): Promise<boolean> {
    return invitacionDAO.update(id, { estado: 'aceptada' });
  }

  async reject(id: number): Promise<boolean> {
    return invitacionDAO.update(id, { estado: 'rechazada' });
  }

  async delete(id: number): Promise<boolean> {
    const invitacion = await invitacionDAO.findById(id);
    if (!invitacion) {
      throw new Error('Invitación no encontrada');
    }

    return invitacionDAO.delete(id);
  }
}

export const invitacionService = new InvitacionService();