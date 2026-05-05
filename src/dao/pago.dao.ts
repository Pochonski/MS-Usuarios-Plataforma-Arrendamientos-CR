import { database } from '../config/database';
import { Pago, CreatePagoDTO, UpdatePagoDTO } from '../models/types';

export class PagoDAO {
  async findAll(): Promise<Pago[]> {
    const result = await database.query<any>('SELECT * FROM pagos ORDER BY fechaSubida DESC');
    return result;
  }

  async findById(id: number): Promise<Pago | null> {
    const result = await database.query<any>('SELECT * FROM pagos WHERE id = @p0', [id]);
    return result[0] || null;
  }

  async findByUser(userId: number): Promise<Pago[]> {
    const result = await database.query<any>(
      'SELECT * FROM pagos WHERE idDueno = @p0 OR idInquilino = @p0 ORDER BY fechaSubida DESC',
      [userId, userId]
    );
    return result;
  }

  async findByContrato(contratoId: number): Promise<Pago[]> {
    const result = await database.query<any>(
      'SELECT * FROM pagos WHERE idContrato = @p0 ORDER BY fechaSubida DESC',
      [contratoId]
    );
    return result;
  }

  async findByMesAnio(mes: number, año: number, contratoId?: number): Promise<Pago[]> {
    let sql = 'SELECT * FROM pagos WHERE mes = @p0 AND año = @p1';
    const params: any[] = [mes, año];

    if (contratoId) {
      sql += ' AND idContrato = @p2';
      params.push(contratoId);
    }

    const result = await database.query<any>(sql, params);
    return result;
  }

  async create(data: CreatePagoDTO): Promise<number> {
    const result = await database.query<any>(
      `INSERT INTO pagos (tipo, idContrato, idPropiedad, idDueno, idInquilino, mes, año, monto, moneda, comprobante, estado, fechaSubida, fechaCreacion)
       OUTPUT INSERTED.id
       VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, GETDATE())`,
      [
        data.tipo,
        data.idContrato,
        data.idPropiedad,
        data.idDueno,
        data.idInquilino,
        data.mes,
        data.año,
        data.monto,
        data.moneda,
        data.comprobante,
        data.estado || 'pendiente',
        data.fechaSubida,
      ]
    );
    return result[0].id;
  }

  async update(id: number, data: UpdatePagoDTO): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.estado !== undefined) { updates.push('estado = @p' + values.length); values.push(data.estado); }
    if (data.fechaRevision !== undefined) { updates.push('fechaRevision = @p' + values.length); values.push(data.fechaRevision); }
    if (data.motivoRechazo !== undefined) { updates.push('motivoRechazo = @p' + values.length); values.push(data.motivoRechazo); }

    if (updates.length === 0) return false;

    values.push(id);
    const rowsAffected = await database.execute(
      `UPDATE pagos SET ${updates.join(', ')} WHERE id = @p${values.length - 1}`,
      values
    );
    return rowsAffected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM pagos WHERE id = @p0', [id]);
    return rowsAffected > 0;
  }
}

export const pagoDAO = new PagoDAO();