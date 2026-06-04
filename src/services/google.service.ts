import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env';
import { GoogleUserInfo } from '../models/types';
import { HttpError, UnauthorizedError } from '../middlewares/errorHandler';

const createClient = () => new OAuth2Client(config.google.clientId);

const VALID_GOOGLE_ISSUERS = new Set<string>([
  'accounts.google.com',
  'https://accounts.google.com',
]);

export async function verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
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