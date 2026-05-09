import { database } from '../config/database';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '../models/types';

export class UsuarioDAO {
  async findAll(): Promise<Usuario[]> {
    const result = await database.query<any>('SELECT * FROM Usuarios');
    return result;
  }

  async findById(id: string): Promise<Usuario | null> {
    const result = await database.query<any>('SELECT * FROM Usuarios WHERE Id = ?', [id]);
    return result[0] || null;
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    const result = await database.query<any>('SELECT * FROM Usuarios WHERE Correo = ?', [correo]);
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<Usuario[]> {
    const result = await database.query<any>('SELECT * FROM Usuarios WHERE Correo LIKE ?', [`%${email}%`]);
    return result;
  }

  async findByRol(rol: 'dueno' | 'inquilino'): Promise<Usuario[]> {
    const result = await database.query<any>('SELECT * FROM Usuarios WHERE Rol = ?', [rol]);
    return result;
  }

  async create(data: CreateUsuarioDTO & { id: string; contrasena?: string | null }): Promise<string> {
    const result = await database.query<any>(
      `INSERT INTO Usuarios (Id, Nombre, Correo, ContrasenaHash, Rol, Telefono, FechaRegistro)
       OUTPUT INSERTED.Id
       VALUES (?, ?, ?, ?, ?, ?, GETDATE())`,
      [
        data.id,
        data.nombre,
        data.correo,
        data.contrasena,
        data.rol,
        data.telefono || null,
      ]
    );
    return result[0].Id;
  }

  async update(id: string, data: UpdateUsuarioDTO): Promise<boolean> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.nombre !== undefined) {
      updates.push('Nombre = ?');
      values.push(data.nombre);
    }
    if (data.correo !== undefined) {
      updates.push('Correo = ?');
      values.push(data.correo);
    }
    if (data.telefono !== undefined) {
      updates.push('Telefono = ?');
      values.push(data.telefono);
    }
    if (data.avatar !== undefined) {
      updates.push('Avatar = ?');
      values.push(data.avatar);
    }

    if (updates.length === 0) return false;

    values.push(id);
    const rowsAffected = await database.execute(
      `UPDATE Usuarios SET ${updates.join(', ')} WHERE Id = ?`,
      values
    );
    return rowsAffected > 0;
  }

  async delete(id: string): Promise<boolean> {
    const rowsAffected = await database.execute('DELETE FROM Usuarios WHERE Id = ?', [id]);
    return rowsAffected > 0;
  }

  async getNextId(): Promise<string> {
    const result = await database.query<any>(
      "SELECT MAX(CAST(SUBSTRING(Id, 5) AS INT)) AS maxId FROM Usuarios WHERE Id LIKE 'usr-%'"
    );
    const maxId = result[0]?.maxId || 0;
    return `usr-${String(maxId + 1).padStart(3, '0')}`;
  }
}

export const usuarioDAO = new UsuarioDAO();