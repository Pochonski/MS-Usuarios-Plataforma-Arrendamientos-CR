import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env';
import { GoogleUserInfo } from '../models/types';
import { HttpError, UnauthorizedError } from '../middlewares/errorHandler';

// We only need the Client ID for verifyIdToken(): Google's public keys (JWKs)
// are fetched from their well-known endpoint, the signature is checked
// against `aud` (the client id), and the payload is returned. The Client
// Secret is NOT required for this flow and is intentionally not read here.
const createClient = () => new OAuth2Client(config.google.clientId);

const VALID_GOOGLE_ISSUERS = new Set<string>([
  'accounts.google.com',
  'https://accounts.google.com',
]);

export interface VerifyGoogleTokenOptions {
  nonce?: string;
  hd?: string;
}

export async function verifyGoogleToken(
  token: string,
  options: VerifyGoogleTokenOptions = {}
): Promise<GoogleUserInfo> {
  if (!config.google.clientId) {
    throw new HttpError('Google OAuth not configured', 500);
  }

  const client = createClient();
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.google.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new UnauthorizedError('Invalid token from Google');
  }
  if (!payload.email) {
    throw new UnauthorizedError('Email not provided by Google');
  }
  if (payload.email_verified !== true) {
    throw new UnauthorizedError('Google account email is not verified');
  }
  if (!payload.iss || !VALID_GOOGLE_ISSUERS.has(payload.iss)) {
    throw new UnauthorizedError('Invalid Google token issuer');
  }

  // Hosted Domain validation — restricts login to a specific Google Workspace domain
  if (options.hd) {
    if (payload.hd !== options.hd) {
      throw new UnauthorizedError(
        `Cuenta de Google debe pertenecer al dominio ${options.hd}`
      );
    }
  }

  // Nonce validation — prevents replay attacks
  if (options.nonce) {
    if (payload.nonce !== options.nonce) {
      throw new UnauthorizedError('Nonce inválido — posible ataque de replay');
    }
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || 'Unknown',
    picture: payload.picture,
  };
}

export const googleService = {
  verifyToken: verifyGoogleToken,
};