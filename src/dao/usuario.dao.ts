import { database } from '../config/database';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '../models/types';

export class UsuarioDAO {
  async findAll(): Promise<Usuario[]> {
    const result = await database.query<Usuario>('SELECT * FROM Usuarios');
    return result;
  }

  async findAllPaginated(page: number, limit: number): Promise<Usuario[]> {
    const offset = (page - 1) * limit;
    const result = await database.query<Usuario>(
      'SELECT * FROM Usuarios ORDER BY FechaRegistro DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY',
      [offset, limit]
    );
    return result;
  }

  async countAll(): Promise<number> {
    const result = await database.query<{ Total: number }>('SELECT COUNT(*) AS Total FROM Usuarios');
    return result[0]?.Total || 0;
  }

  async findById(id: string): Promise<Usuario | null> {
    const result = await database.query<Usuario>('SELECT * FROM Usuarios WHERE Id = ?', [id]);
    return result[0] || null;
  }

  async findByCorreo(correo: string): Promise<Usuario | null> {
    const result = await database.query<Usuario>('SELECT * FROM Usuarios WHERE Correo = ?', [correo]);
    return result[0] || null;
  }

  async findByCorreoExcludingId(correo: string, excludeId: string): Promise<Usuario | null> {
    const result = await database.query<Usuario>(
      'SELECT * FROM Usuarios WHERE Correo = ? AND Id != ?',
      [correo, excludeId]
    );
    return result[0] || null;
  }

  async findByEmail(email: string): Promise<Usuario[]> {
    const escaped = email.replace(/%/g, '\\%').replace(/_/g, '\\_');
    const result = await database.query<Usuario>('SELECT * FROM Usuarios WHERE Correo LIKE ?', [`${escaped}%`]);
    return result;
  }

  async findByRol(rol: 'dueno' | 'inquilino'): Promise<Usuario[]> {
    const result = await database.query<Usuario>('SELECT * FROM Usuarios WHERE Rol = ?', [rol]);
    return result;
  }

  async create(data: CreateUsuarioDTO & { id: string; contrasena?: string | null; googleId?: string }): Promise<string> {
    const result = await database.query<{ Id: string }>(
      `INSERT INTO Usuarios (Id, Nombre, Correo, ContrasenaHash, Rol, Telefono, GoogleId, FechaRegistro)
       OUTPUT INSERTED.Id
       VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())`,
      [
        data.id,
        data.nombre,
        data.correo,
        data.contrasena ?? null,  // null for OAuth users
        data.rol,
        data.telefono || null,
        data.googleId || null,
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

  async updateLastLogin(id: string): Promise<void> {
    await database.execute('UPDATE Usuarios SET UltimoLogin = GETDATE() WHERE Id = ?', [id]);
  }

  async getNextId(): Promise<string> {
    // Use atomic sequence table to avoid race conditions
    const result = await database.query<{ CurrentValue: number }>(
      `UPDATE Sequences SET CurrentValue = CurrentValue + 1 OUTPUT INSERTED.CurrentValue WHERE Name = 'UsuarioId'`
    );
    const nextValue = result[0]?.CurrentValue;
    if (!nextValue) {
      throw new Error('Sequence UsuarioId not found in Sequences table. Run sql/schema.sql to initialize.');
    }
    return `usr-${String(nextValue).padStart(3, '0')}`;
  }
}

export const usuarioDAO = new UsuarioDAO();