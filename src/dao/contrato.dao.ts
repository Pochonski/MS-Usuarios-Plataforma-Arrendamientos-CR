import { database } from '../config/database';
import { Contrato, CreateContratoDTO, UpdateContratoDTO } from '../models/types';

export class ContratoDAO {
  async findAll(): Promise<Contrato[]> {
    const result = await database.query<any>('SELECT * FROM contratos ORDER BY fechaCreacion DESC');
    return result;
  }

  async findById(id: number): Promise<Contrato | null> {
    const result = await database.query<any>('SELECT * FROM contratos WHERE id = @p0', [id]);
    return result[0] || null;
  }

  async findByInquilino(inquilinoId: number): Promise<Contrato[]> {
    const result = await database.query<any>(
      'SELECT * FROM contratos WHERE inquilinoId = @p0 ORDER BY fechaCreacion DESC',
      [inquilinoId]
    );
    return result;
  }

  async findByDueno(duenoId: number): Promise<Contrato[]> {
    const result = await database.query<any>(
      'SELECT * FROM contratos WHERE duenoId = @p0 ORDER BY fechaCreacion DESC',
      [duenoId]
    );
    return result;
  }

  async findByPropiedad(propiedadId: number): Promise<Contrato[]> {
    const result = await database.query<any>(
      'SELECT * FROM contratos WHERE propiedadId = @p0 ORDER BY fechaCreacion DESC',
      [propiedadId]
    );
    return result;
  }

  async findActivosByInquilino(inquilinoId: number): Promise<Contrato[]> {
    const result = await database.query<any>(
      "SELECT * FROM contratos WHERE inquilinoId = @p0 AND estado = 'activo' ORDER BY fechaCreacion DESC",
      [inquilinoId]
    );
    return result;
  }

  async create(data: CreateContratoDTO): Promise<number> {
    const result = await database.query<any>(
      `INSERT INTO contratos (invitacionId, propiedadId, duenoId, inquilinoId, montoMensual, montoDeposito, moneda, fechaInicio, estado, estadoDeposito, fechaCreacion)
       OUTPUT INSERTED.id
       VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, GETDATE())`,
      [
        data.invitacionId,
        data.propiedadId,
        data.duenoId,
        data.inquilinoId,
        data.montoMensual,
        data.montoDeposito,
        data.moneda,
        data.fechaInicio,
        data.estado || 'en_proceso',
        data.estadoDeposito || 'pendiente',
      ]
    );
    return result[0].id;
  }

  async update(id: number, data: UpdateContratoDTO): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.estado !== undefined) { updates.push('estado = @p' + values.length); values.push(data.estado); }
    if (data.estadoDeposito !== undefined) { updates.push('estadoDeposito = @p' + values.length); values.push(data.estadoDeposito); }

    if (updates.length === 0) return false;

    values.push(id);
    const rowsAffected = await database.execute(
      `UPDATE contratos SET ${updates.join(', ')} WHERE id = @p${values.length - 1}`,
      values
    );
    return rowsAffected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM contratos WHERE id = @p0', [id]);
    return rowsAffected > 0;
  }
}

export const contratoDAO = new ContratoDAO();