import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    name: process.env.DB_NAME || 'usuarios_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: (() => {
      const secret = process.env.JWT_SECRET;
      if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production');
      }
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is required');
      }
      return secret;
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  apim: {
    subscriptionKey: process.env.APIM_SUBSCRIPTION_KEY || '',
    clientCertThumbprint: process.env.APIM_CLIENT_CERT_THUMBPRINT || '',
    validateClientCert: process.env.APIM_VALIDATE_CLIENT_CERT === 'true',
    internalApiUrl: process.env.APIM_INTERNAL_API_URL || '',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    allowedDomain: process.env.GOOGLE_ALLOWED_DOMAIN || '',
  },

  emailVerification: {
    frontendBaseUrl: process.env.EMAIL_VERIFICATION_FRONTEND_URL || 'https://agreeable-ground-0b1436910.6.azurestaticapps.net',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RL_WINDOW_MINUTES || '15', 10),
    auth: {
      max: parseInt(process.env.RL_AUTH_MAX || '5', 10),
    },
    read: {
      max: parseInt(process.env.RL_READ_MAX || '200', 10),
    },
    write: {
      max: parseInt(process.env.RL_WRITE_MAX || '50', 10),
    },
    general: {
      max: parseInt(process.env.RL_GENERAL_MAX || '100', 10),
    },
  },
};