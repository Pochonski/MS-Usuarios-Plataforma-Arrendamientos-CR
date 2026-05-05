import { database } from '../config/database';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '../models/types';

export class UsuarioDAO {
  async findAll(): Promise<Usuario[]> {
    const result = await database.query<any>('SELECT * FROM usuarios');
    return result;
  }

  async findById(id: number): Promise<Usuario | null> {
    const result = await database.query<any>('SELECT * FROM usuarios WHERE id = @p0', [id]);
    return result[0] || null;
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    const result = await database.query<any>('SELECT * FROM usuarios WHERE correo = @p0', [correo]);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<Usuario[]> {
    const result = await database.query<any>('SELECT * FROM usuarios WHERE correo LIKE @p0', [`%${email}%`]);
    return result;
  }

  async create(data: CreateUsuarioDTO): Promise<number> {
    const result = await database.query<any>(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol, telefono, propiedades, fechaRegistro)
       OUTPUT INSERTED.id
       VALUES (@p0, @p1, @p2, @p3, @p4, @p5, GETDATE())`,
      [
        data.nombre,
        data.correo,
        data.contrasena,
        data.rol,
        data.telefono,
        JSON.stringify(data.propiedades || []),
      ]
    );
    return result[0].id;
  }

  async update(id: number, data: UpdateUsuarioDTO): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) {
      updates.push('nombre = @p' + values.length);
      values.push(data.nombre);
    }
    if (data.correo !== undefined) {
      updates.push('correo = @p' + values.length);
      values.push(data.correo);
    }
    if (data.telefono !== undefined) {
      updates.push('telefono = @p' + values.length);
      values.push(data.telefono);
    }

    if (updates.length === 0) return false;

    values.push(id);
    const rowsAffected = await database.execute(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = @p${values.length - 1}`,
      values
    );
    return rowsAffected > 0;
  }

  async delete(id: number): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM usuarios WHERE id = @p0', [id]);
    return rowsAffected > 0;
  }

  async updatePropiedades(id: number, propiedades: number[]): Promise<boolean> {
    const rowsAffected = await database.execute(
      'UPDATE usuarios SET propiedades = @p0 WHERE id = @p1',
      [JSON.stringify(propiedades), id]
    );
    return rowsAffected > 0;
  }
}

export const usuarioDAO = new UsuarioDAO();