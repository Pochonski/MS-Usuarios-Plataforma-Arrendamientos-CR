/**
 * DAO: TokensRevocados (Phase 5)
 * Maneja la tabla de tokens revocados para invalidación de sesiones
 */

import { database } from '../config/database';

export class TokenRevocadoDAO {
  /**
   * Revoca un token insertándolo en la tabla
   * @param tokenId - Identificador único del token (jti del JWT)
   * @param expiracion - Fecha de expiración del token (opcional, para cleanup)
   */
  async revoke(tokenId: string, expiracion?: Date): Promise<void> {
    await database.execute(
      'INSERT INTO TokensRevocados (TokenId, Expiracion) VALUES (?, ?)',
      [tokenId, expiracion || null]
    );
  }

  /**
   * Verifica si un token está revoked
   * @param tokenId - Identificador del token
   * @returns true si está revoked
   */
  async isRevoked(tokenId: string): Promise<boolean> {
    const result = await database.query<{ cnt: number }>(
      'SELECT COUNT(*) as cnt FROM TokensRevocados WHERE TokenId = ?',
      [tokenId]
    );
    return (result[0]?.cnt || 0) > 0;
  }

  /**
   * Limpia tokens revocados con más de 7 días
   * @returns Número de tokens eliminados
   */
  async cleanup(): Promise<number> {
    const result = await database.query<{ Eliminados: number }>(
      `DECLARE @FechaLimite DATETIME2 = DATEADD(DAY, -7, GETDATE());
       DELETE FROM TokensRevocados
       WHERE Expiracion IS NOT NULL AND Expiracion < @FechaLimite
          OR (Expiracion IS NULL AND RevocadoEl < @FechaLimite);
       SELECT @@ROWCOUNT as Eliminados;`
    );
    return result[0]?.Eliminados || 0;
  }
}

export const tokenRevocadoDAO = new TokenRevocadoDAO();