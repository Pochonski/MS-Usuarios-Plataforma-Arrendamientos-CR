import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env';
import { GoogleUserInfo } from '../models/types';

const createClient = () => new OAuth2Client(config.google.clientId);

export async function verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
  if (!config.google.clientId) {
    throw new Error('Google OAuth not configured');
  }

  const client = createClient();
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: config.google.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid token from Google');
  }
  if (!payload.email) {
    throw new Error('Email not provided by Google');
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