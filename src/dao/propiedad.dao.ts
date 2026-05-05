import { database } from '../config/database';
import { Propiedad, CreatePropiedadDTO, UpdatePropiedadDTO, PaginatedResponse } from '../models/types';

export class PropiedadDAO {
  async findAll(
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
    let whereClause = '1=1';
    const params: any[] = [];

    if (filters.search) {
      whereClause += ' AND (titulo LIKE @p' + params.length + ' OR descripcion LIKE @p' + params.length + ')';
      params.push(`%${filters.search}%`);
    }
    if (filters.provincia) {
      whereClause += ' AND provincia = @p' + params.length;
      params.push(filters.provincia);
    }
    if (filters.tipo) {
      whereClause += ' AND tipo = @p' + params.length;
      params.push(filters.tipo);
    }
    if (filters.precioMin) {
      whereClause += ' AND precio >= @p' + params.length;
      params.push(filters.precioMin);
    }
    if (filters.precioMax) {
      whereClause += ' AND precio <= @p' + params.length;
      params.push(filters.precioMax);
    }
    if (filters.duenoId) {
      whereClause += ' AND idDueno = @p' + params.length;
      params.push(filters.duenoId);
    }

    const countParamIndex = params.length;

    const countResult = await database.query<any>(
      `SELECT COUNT(*) as total FROM propiedades WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const offset = (page - 1) * limit;
    const pageParams = [...params, limit, offset];

    const rows = await database.query<any>(
      `SELECT * FROM propiedades WHERE ${whereClause} ORDER BY fechaCreacion DESC OFFSET @p${countParamIndex} ROWS FETCH NEXT @p${countParamIndex + 1} ROWS ONLY`,
      pageParams
    );

    return {
      data: rows,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Propiedad | null> {
    const result = await database.query<any>('SELECT * FROM propiedades WHERE id = @p0', [id]);
    return result[0] || null;
  }

  async create(data: CreatePropiedadDTO): Promise<number> {
    const result = await database.query<any>(
      `INSERT INTO propiedades (titulo, descripcion, precio, moneda, provincia, canton, distrito, tipo, estado, imagenes, idDueno, amenidades, fechaCreacion)
       OUTPUT INSERTED.id
       VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, GETDATE())`,
      [
        data.titulo,
        data.descripcion,
        data.precio,
        data.moneda,
        data.provincia,
        data.canton,
        data.distrito,
        data.tipo,
        data.estado || 'disponible',
        JSON.stringify(data.imagenes),
        data.idDueno,
        JSON.stringify(data.amenidades),
      ]
    );
    return result[0].id;
  }

  async update(id: number, data: UpdatePropiedadDTO): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.titulo !== undefined) { updates.push('titulo = @p' + values.length); values.push(data.titulo); }
    if (data.descripcion !== undefined) { updates.push('descripcion = @p' + values.length); values.push(data.descripcion); }
    if (data.precio !== undefined) { updates.push('precio = @p' + values.length); values.push(data.precio); }
    if (data.moneda !== undefined) { updates.push('moneda = @p' + values.length); values.push(data.moneda); }
    if (data.provincia !== undefined) { updates.push('provincia = @p' + values.length); values.push(data.provincia); }
    if (data.canton !== undefined) { updates.push('canton = @p' + values.length); values.push(data.canton); }
    if (data.distrito !== undefined) { updates.push('distrito = @p' + values.length); values.push(data.distrito); }
    if (data.tipo !== undefined) { updates.push('tipo = @p' + values.length); values.push(data.tipo); }
    if (data.estado !== undefined) { updates.push('estado = @p' + values.length); values.push(data.estado); }
    if (data.imagenes !== undefined) { updates.push('imagenes = @p' + values.length); values.push(JSON.stringify(data.imagenes)); }
    if (data.amenidades !== undefined) { updates.push('amenidades = @p' + values.length); values.push(JSON.stringify(data.amenidades)); }

    if (updates.length === 0) return false;

    values.push(id);
    const rowsAffected = await database.execute(
      `UPDATE propiedades SET ${updates.join(', ')} WHERE id = @p${values.length - 1}`,
      values
    );
    return rowsAffected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM propiedades WHERE id = @p0', [id]);
    return rowsAffected > 0;
  }
}

export const propiedadDAO = new PropiedadDAO();