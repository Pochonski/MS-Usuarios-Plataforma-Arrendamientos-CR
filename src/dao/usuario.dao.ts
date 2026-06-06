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

  async findByGoogleId(googleId: string): Promise<Usuario | null> {
    const result = await database.query<Usuario>(
      'SELECT * FROM Usuarios WHERE GoogleId = ?',
      [googleId]
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

  async create(data: CreateUsuarioDTO & { id: string; contrasena?: string | null; googleId?: string; avatar?: string }): Promise<string> {
    const result = await database.query<{ Id: string }>(
      `INSERT INTO Usuarios (Id, Nombre, Correo, ContrasenaHash, Rol, Telefono, Avatar, GoogleId, FechaRegistro)
       OUTPUT INSERTED.Id
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETDATE())`,
      [
        data.id,
        data.nombre,
        data.correo,
        data.contrasena ?? null,
        data.rol,
        data.telefono || null,
        data.avatar || null,
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

  async setGoogleId(id: string, googleId: string): Promise<void> {
    await database.execute('UPDATE Usuarios SET GoogleId = ? WHERE Id = ?', [googleId, id]);
  }

  async setGoogleProfile(id: string, googleId: string, avatar: string | null): Promise<void> {
    // Set GoogleId and, if the user has no avatar yet, populate it from Google
    await database.execute(
      `UPDATE Usuarios
         SET GoogleId = ?,
             Avatar = COALESCE(Avatar, ?)
       WHERE Id = ?`,
      [googleId, avatar, id]
    );
  }

  // Phase 5: Account Lockout
  async incrementFailedAttempts(id: string): Promise<number> {
    // Get current attempts
    const current = await database.query<{ IntentosFallidos: number }>(
      'SELECT IntentosFallidos FROM Usuarios WHERE Id = ?',
      [id]
    );
    const currentAttempts = current[0]?.IntentosFallidos || 0;
    const newAttempts = currentAttempts + 1;

    // If >= 5, set 15-minute lockout
    let bloqueadoHasta = null;
    if (newAttempts >= 5) {
      bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000); // 15 min from now
    }

    await database.execute(
      'UPDATE Usuarios SET IntentosFallidos = ?, BloqueadoHasta = ? WHERE Id = ?',
      [newAttempts, bloqueadoHasta, id]
    );

    return newAttempts;
  }

  async resetFailedAttempts(id: string): Promise<void> {
    await database.execute(
      'UPDATE Usuarios SET IntentosFallidos = 0, BloqueadoHasta = NULL WHERE Id = ?',
      [id]
    );
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