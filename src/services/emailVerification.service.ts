import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const EMAIL_VERIFY_SECRET = `${config.jwt.secret}-email-verify`;

export interface EmailVerificationPayload {
  userId: string;
  correo: string;
}

/**
 * Genera un token JWT para verificación de email.
 * El token expira en 24 horas.
 */
export function generateEmailVerificationToken(userId: string, correo: string): string {
  return jwt.sign({ userId, correo }, EMAIL_VERIFY_SECRET, { expiresIn: '24h' });
}

/**
 * Verifica y decodifica un token de verificación de email.
 * @throws UnauthorizedError si el token es inválido o expirado
 */
export function verifyEmailVerificationToken(token: string): EmailVerificationPayload {
  try {
    const payload = jwt.verify(token, EMAIL_VERIFY_SECRET) as EmailVerificationPayload;
    return payload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new Error('El enlace de verificación ha expirado. Solicita uno nuevo.');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new Error('Token de verificación inválido.');
    }
    throw err;
  }
}

/**
 * Construye la URL de verificación para enviar por email.
 * El frontend usa esta URL para redireccionar al usuario.
 */
export function buildEmailVerificationUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/verify-email?token=${token}`;
}

/**
 * Simula el envío de un email de verificación.
 * En producción, reemplazar con SendGrid, Azure Communication Services, etc.
 */
export async function sendVerificationEmail(
  correo: string,
  nombre: string,
  verificationUrl: string
): Promise<void> {
  // TODO (production): integrate real email provider
  // Options: SendGrid, AWS SES, Azure Communication Services, Resend, Nodemailer (SMTP)
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  📧 EMAIL DE VERIFICACIÓN (simulado en desarrollo)         ║
╠══════════════════════════════════════════════════════════════╣
║  Para: ${correo.padEnd(50)}║
║  Nombre: ${nombre.padEnd(48)}║
║                                                              ║
║  Haz click en el siguiente enlace para verificar tu email:   ║
║  ${verificationUrl.substring(0, 56).padEnd(56)}║
║  ${verificationUrl.substring(56).padEnd(56)}║
╚══════════════════════════════════════════════════════════════╝
  `);
}