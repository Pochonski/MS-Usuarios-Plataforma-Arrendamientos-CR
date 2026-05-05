import { database } from '../config/database';
import { Mensaje, CreateMensajeDTO, UpdateMensajeDTO } from '../models/types';

export class MensajeDAO {
  async findAll(): Promise<Mensaje[]> {
    const result = await database.query<any>('SELECT * FROM mensajes ORDER BY fecha ASC');
    return result;
  }

  async findById(id: number): Promise<Mensaje | null> {
    const result = await database.query<any>('SELECT * FROM mensajes WHERE id = @p0', [id]);
    return result[0] || null;
  }

  async findByConversation(conversationId: number): Promise<Mensaje[]> {
    const result = await database.query<any>(
      'SELECT * FROM mensajes WHERE conversationId = @p0 ORDER BY fecha ASC',
      [conversationId]
    );
    return result;
  }

  async findByUser(userId: number): Promise<Mensaje[]> {
    const result = await database.query<any>(
      'SELECT * FROM mensajes WHERE senderId = @p0 OR receiverId = @p0 ORDER BY fecha DESC',
      [userId, userId]
    );
    return result;
  }

  async findUnreadByUser(userId: number): Promise<Mensaje[]> {
    const result = await database.query<any>(
      "SELECT * FROM mensajes WHERE receiverId = @p0 AND status = 'enviado' ORDER BY fecha DESC",
      [userId]
    );
    return result;
  }

  async create(data: CreateMensajeDTO): Promise<number> {
    const result = await database.query<any>(
      `INSERT INTO mensajes (conversationId, senderId, receiverId, content, type, status, fecha, fechaCreacion)
       OUTPUT INSERTED.id
       VALUES (@p0, @p1, @p2, @p3, @p4, 'enviado', GETDATE(), GETDATE())`,
      [
        data.conversationId,
        data.senderId,
        data.receiverId,
        data.content,
        data.type || 'text',
      ]
    );
    return result[0].id;
  }

  async update(id: number, data: UpdateMensajeDTO): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) { updates.push('status = @p' + values.length); values.push(data.status); }

    if (updates.length === 0) return false;

    values.push(id);
    const rowsAffected = await database.execute(
      `UPDATE mensajes SET ${updates.join(', ')} WHERE id = @p${values.length - 1}`,
      values
    );
    return rowsAffected > 0;
  }

  async markAsRead(conversationId: number, userId: number): Promise<boolean> {
    const rowsAffected = await database.execute(
      "UPDATE mensajes SET status = 'leido' WHERE conversationId = @p0 AND receiverId = @p1 AND status = 'enviado'",
      [conversationId, userId]
    );
    return rowsAffected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM mensajes WHERE id = @p0', [id]);
    return rowsAffected > 0;
  }
}

export const mensajeDAO = new MensajeDAO();