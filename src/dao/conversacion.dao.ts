import { database } from '../config/database';
import { Conversacion, CreateConversacionDTO } from '../models/types';

export class ConversacionDAO {
  async findAll(): Promise<Conversacion[]> {
    const result = await database.query<any>('SELECT * FROM conversaciones ORDER BY fechaCreacion DESC');
    return result;
  }

  async findById(id: number): Promise<Conversacion | null> {
    const result = await database.query<any>('SELECT * FROM conversaciones WHERE id = @p0', [id]);
    return result[0] || null;
  }

  async findByUser(userId: number): Promise<Conversacion[]> {
    const result = await database.query<any>(
      'SELECT * FROM conversaciones WHERE participants LIKE @p0',
      [`%${userId}%`]
    );
    return result;
  }

  async findByProperty(propertyId: number): Promise<Conversacion[]> {
    const result = await database.query<any>(
      'SELECT * FROM conversaciones WHERE propertyId = @p0 ORDER BY fechaCreacion DESC',
      [propertyId]
    );
    return result;
  }

  async findExisting(participants: number[], propertyId?: number): Promise<Conversacion | null> {
    const participantsJson = JSON.stringify(participants.sort());

    let sql = 'SELECT * FROM conversaciones WHERE participants = @p0';
    const params: any[] = [participantsJson];

    if (propertyId) {
      sql += ' AND propertyId = @p1';
      params.push(propertyId);
    }

    const result = await database.query<any>(sql, params);
    return result[0] || null;
  }

  async create(data: CreateConversacionDTO): Promise<number> {
    const result = await database.query<any>(
      `INSERT INTO conversaciones (participants, propertyId, type, fechaCreacion)
       OUTPUT INSERTED.id
       VALUES (@p0, @p1, @p2, GETDATE())`,
      [
        JSON.stringify(data.participants),
        data.propertyId || null,
        data.type,
      ]
    );
    return result[0].id;
  }

  async delete(id: number): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM conversaciones WHERE id = @p0', [id]);
    return rowsAffected > 0;
  }
}

export const conversacionDAO = new ConversacionDAO();