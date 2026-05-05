import { database } from '../config/database';
import { Invitacion, CreateInvitacionDTO, UpdateInvitacionDTO } from '../models/types';

export class InvitacionDAO {
  async findAll(): Promise<Invitacion[]> {
    const result = await database.query<any>('SELECT * FROM invitaciones ORDER BY fechaCreacion DESC');
    return result;
  }

  async findById(id: number): Promise<Invitacion | null> {
    const result = await database.query<any>('SELECT * FROM invitaciones WHERE id = @p0', [id]);
    return result[0] || null;
  }

  async findByPropiedad(propiedadId: number): Promise<Invitacion[]> {
    const result = await database.query<any>(
      'SELECT * FROM invitaciones WHERE propiedadId = @p0 ORDER BY fechaCreacion DESC',
      [propiedadId]
    );
    return result;
  }

  async findByDueno(duenoId: number): Promise<Invitacion[]> {
    const result = await database.query<any>(
      'SELECT * FROM invitaciones WHERE duenoId = @p0 ORDER BY fechaCreacion DESC',
      [duenoId]
    );
    return result;
  }

  async findByInquilinoCorreo(correo: string): Promise<Invitacion[]> {
    const result = await database.query<any>(
      'SELECT * FROM invitaciones WHERE inquilinoCorreo = @p0 ORDER BY fechaCreacion DESC',
      [correo]
    );
    return result;
  }

  async create(data: CreateInvitacionDTO): Promise<number> {
    const result = await database.query<any>(
      `INSERT INTO invitaciones (propiedadId, duenoId, inquilinoCorreo, montoAlquiler, montoDeposito, moneda, estado, fechaCreacion)
       OUTPUT INSERTED.id
       VALUES (@p0, @p1, @p2, @p3, @p4, @p5, 'pendiente', GETDATE())`,
      [
        data.propiedadId,
        data.duenoId,
        data.inquilinoCorreo,
        data.montoAlquiler,
        data.montoDeposito,
        data.moneda,
      ]
    );
    return result[0].id;
  }

  async update(id: number, data: UpdateInvitacionDTO): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.estado !== undefined) {
      updates.push('estado = @p' + values.length);
      values.push(data.estado);
    }

    if (updates.length === 0) return false;

    values.push(id);
    const rowsAffected = await database.execute(
      `UPDATE invitaciones SET ${updates.join(', ')} WHERE id = @p${values.length - 1}`,
      values
    );
    return rowsAffected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM invitaciones WHERE id = @p0', [id]);
    return rowsAffected > 0;
  }
}

export const invitacionDAO = new InvitacionDAO();