import { notificacionDAO } from '../dao/notificacion.dao';
import { CreateNotificacionDTO, UpdateNotificacionDTO, Notificacion } from '../models/types';

export class NotificacionService {
  async getAll(): Promise<Notificacion[]> {
    return notificacionDAO.findAll();
  }

  async getById(id: number): Promise<Notificacion | null> {
    return notificacionDAO.findById(id);
  }

  async getByUser(userId: number): Promise<Notificacion[]> {
    return notificacionDAO.findByUser(userId);
  }

  async getUnreadByUser(userId: number): Promise<Notificacion[]> {
    return notificacionDAO.findUnreadByUser(userId);
  }

  async create(data: CreateNotificacionDTO): Promise<{ id: number; notificacion: Notificacion }> {
    const id = await notificacionDAO.create(data);
    const notificacion = await notificacionDAO.findById(id);

    if (!notificacion) {
      throw new Error('Error al crear notificación');
    }

    return { id, notificacion };
  }

  async markAsRead(id: number): Promise<boolean> {
    return notificacionDAO.update(id, { leida: true });
  }

  async markAsUnread(id: number): Promise<boolean> {
    return notificacionDAO.update(id, { leida: false });
  }

  async markAllAsRead(userId: number): Promise<boolean> {
    return notificacionDAO.markAllAsRead(userId);
  }

  async delete(id: number): Promise<boolean> {
    const notificacion = await notificacionDAO.findById(id);
    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }

    return notificacionDAO.delete(id);
  }

  async deleteByUser(userId: number): Promise<boolean> {
    return notificacionDAO.deleteByUser(userId);
  }
}

export const notificacionService = new NotificacionService();