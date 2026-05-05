import { database } from '../config/database';
import { Notificacion, CreateNotificacionDTO, UpdateNotificacionDTO } from '../models/types';

export class NotificacionDAO {
  async findAll(): Promise<Notificacion[]> {
    const result = await database.query<any>('SELECT * FROM notificaciones ORDER BY fecha DESC');
    return result;
  }

  async findById(id: number): Promise<Notificacion | null> {
    const result = await database.query<any>('SELECT * FROM notificaciones WHERE id = @p0', [id]);
    return result[0] || null;
  }

  async findByUser(userId: number): Promise<Notificacion[]> {
    const result = await database.query<any>(
      'SELECT * FROM notificaciones WHERE userId = @p0 ORDER BY fecha DESC',
      [userId]
    );
    return result;
  }

  async findUnreadByUser(userId: number): Promise<Notificacion[]> {
    const result = await database.query<any>(
      'SELECT * FROM notificaciones WHERE userId = @p0 AND leida = 0 ORDER BY fecha DESC',
      [userId]
    );
    return result;
  }

  async create(data: CreateNotificacionDTO): Promise<number> {
    const result = await database.query<any>(
      `INSERT INTO notificaciones (userId, tipo, titulo, mensaje, leida, fecha, link, fechaCreacion)
       OUTPUT INSERTED.id
       VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, GETDATE())`,
      [
        data.userId,
        data.tipo,
        data.titulo,
        data.mensaje,
        data.leida !== undefined ? data.leida : false,
        data.fecha,
        data.link || null,
      ]
    );
    return result[0].id;
  }

  async update(id: number, data: UpdateNotificacionDTO): Promise<boolean> {
    const rowsAffected = await database.execute(
      'UPDATE notificaciones SET leida = @p0 WHERE id = @p1',
      [data.leida, id]
    );
    return rowsAffected > 0;
  }

  async markAllAsRead(userId: number): Promise<boolean> {
    const rowsAffected = await database.execute(
      'UPDATE notificaciones SET leida = 1 WHERE userId = @p0',
      [userId]
    );
    return rowsAffected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM notificaciones WHERE id = @p0', [id]);
    return rowsAffected > 0;
  }

  async deleteByUser(userId: number): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM notificaciones WHERE userId = @p0', [userId]);
    return rowsAffected > 0;
  }
}

export const notificacionDAO = new NotificacionDAO();